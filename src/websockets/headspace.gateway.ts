import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from '../auth/jtw.payload.interface';
import { SocketErrorResponse } from './socket.core.messages';
import { BoardService } from '../board/board.service';
import { HeadspaceService } from '../board/headspace/headspace.service';
import { ActionRequest, ExerciseRequest } from './model.dto';
import { RetroUser } from '../board/users/retro-user.dto';

@WebSocketGateway()
export class HeadspaceGateway {
  @WebSocketServer() server: Server;

  constructor(
    private boardService: BoardService,
    private headspaceService: HeadspaceService,
  ) {}

  private assertFacilitator(user: JwtPayload) {
    if (!user || user.role !== 'facilitator') {
      throw new SocketErrorResponse('FORBIDDEN', 'Only facilitators may do that.');
    }
  }

  @SubscribeMessage('board:headspace:exercise:select')
  async select(@ConnectedSocket() socket: Socket, @MessageBody() { exerciseId }: ExerciseRequest) {
    try {
      this.assertFacilitator(socket.data.user);
      const board = await this.boardService.getBoard(socket.data.user.boardId);
      const data = this.headspaceService.selectExercise(board, exerciseId!);
      this.server.to(board.id).emit('headspace:exercise:selected', data);
      return data;
    } catch (err) {
      return err;
    }
  }

  @SubscribeMessage('board:headspace:exercise:start')
  async start(@ConnectedSocket() socket: Socket, @MessageBody() { exerciseId }: ExerciseRequest) {
    try {
      this.assertFacilitator(socket.data.user);
      const board = await this.boardService.getBoard(socket.data.user.boardId);

      const data = this.headspaceService.startExercise(board, async (boardId) => {
        // advance stage on completion
        this.boardService.updateStage(board.id, 'explore');
        this.server.to(boardId).emit('headspace:exercise:completed', { exerciseId });
        this.server.to(boardId).emit('stage-changed', { stage: 'explore' });
      });

      this.server.to(board.id).emit('headspace:exercise:started', data);
      return data;
    } catch (err) {
      return err;
    }
  }

  @SubscribeMessage('board:headspace:exercise:stop')
  async stop(@ConnectedSocket() socket: Socket) {
    try {
      this.assertFacilitator(socket.data.user);
      const board = await this.boardService.getBoard(socket.data.user.boardId);
      const data = this.headspaceService.stopExercise(board);
      this.server.to(board.id).emit('headspace:exercise:stopped', data);
      return data;
    } catch (err) {
      return err;
    }
  }

  @SubscribeMessage('board:headspace:exercise:restart')
  async restart(@ConnectedSocket() socket: Socket) {
    try {
      this.assertFacilitator(socket.data.user);
      const board = await this.boardService.getBoard(socket.data.user.boardId);
      const data = this.headspaceService.resetExercise(board);
      this.server.to(board.id).emit('headspace:exercise:restarted', data);
      return data;
    } catch (err) {
      return err;
    }
  }

  /** participants call this for any game-specific event */
  @SubscribeMessage('board:headspace:exercise:action')
  async onAction(@ConnectedSocket() socket: Socket, @MessageBody() { action, payload }: ActionRequest) {
    const user: RetroUser = socket.data.user;
    const board = await this.boardService.getBoard(user.boardId);
    let exercise;

    try {
      exercise = this.headspaceService.getActiveExercise(board.id);
      exercise.handleAction(user.id, action, payload);

      // broadcast to everyone what just happened
      this.server.to(board.id).emit('headspace:exercise:action', {
        exerciseId: exercise.exerciseId,
        action,
        userId: user.id,
        payload,
      });
    } catch (err: any) {
      return new SocketErrorResponse('BAD_REQUEST', err.message);
    }
  }
}
