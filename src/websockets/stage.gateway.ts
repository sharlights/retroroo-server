import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketErrorResponse } from './socket.core.messages';
import { BoardService } from '../board/board.service';
import { ChangeStageRequest, UpdateStageFinishedRequest } from './request.model.dto';
import { Logger } from '@nestjs/common';
import { StageService } from 'src/board/stage/stage.service';
import { RetroUser } from '../board/users/retro-user.dto';
import { StageChangedEvent, StageMetadataUpdatedEvent } from './events.model.dto';

@WebSocketGateway()
export class StageGateway {
  private readonly logger = new Logger(StageGateway.name);
  @WebSocketServer() server: Server;

  constructor(
    private stageService: StageService,
    private boardService: BoardService,
  ) {}

  @SubscribeMessage('board:stage:finished')
  async changeFinishedStatus(@ConnectedSocket() socket: Socket, @MessageBody() request: UpdateStageFinishedRequest) {
    const user: RetroUser = socket.data.user;

    const board = await this.boardService.getBoard(user.boardId);
    if (board && board.stage === request.stage) {
      this.logger.log(`[Board: ${user.boardId}] User ${user.id} has finished stage: ${board.stage}`);

      await this.stageService.updateFinished(user.id, board.id, request.stage, request.finished);

      const finishedUsers: string[] = await this.stageService.getFinished(board.id, request.stage);

      this.logger.log(
        `[Board: ${user.boardId}] Current Finished users for stage ${request.stage}: ${finishedUsers.length}`,
      );
      this.server.to(board.id).emit('board:stage:metadata:updated', {
        stage: board.stage,
        finishedUsers: finishedUsers,
      } as StageMetadataUpdatedEvent);
    }
  }

  @SubscribeMessage('board:stage:change')
  async changeStage(@ConnectedSocket() socket: Socket, @MessageBody() changeStageRequest: ChangeStageRequest) {
    const user: RetroUser = socket.data.user;

    if (!user || user.role != 'facilitator') {
      this.logger.warn(`[Board: ${user.boardId}] Unable to change stage - not facilitator`);
      return new SocketErrorResponse('FORBIDDEN', 'Only facilitators can change the stage.');
    }
    const newStage = changeStageRequest.stage;

    const board = await this.boardService.updateStage(user.boardId, newStage);
    const finishedUsers: string[] = await this.stageService.getFinished(board.id, board.stage);

    this.logger.log(`[Board: ${board.id}] Stage changed to: ${newStage}`);
    this.server.to(board.id).emit('board:stage:updated', {
      stage: newStage,
      finishedUsers: finishedUsers,
    } as StageChangedEvent);
  }
}
