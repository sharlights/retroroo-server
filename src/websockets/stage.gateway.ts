import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from '../auth/jtw.payload.interface';
import { SocketErrorResponse } from './socket.core.messages';
import { BoardService } from '../board/board.service';
import { ChangeStageRequest, StageChangedEvent } from './model.dto';
import { Logger } from '@nestjs/common';

@WebSocketGateway()
export class StageGateway {
  private readonly logger = new Logger(StageGateway.name);
  @WebSocketServer() server: Server;

  constructor(private boardService: BoardService) {}

  @SubscribeMessage('board:stage:change')
  async changeStage(@ConnectedSocket() socket: Socket, @MessageBody() changeStageRequest: ChangeStageRequest) {
    const user: JwtPayload = socket.data.user;

    if (!user || user.role != 'facilitator') {
      this.logger.warn(`[Board: ${user.boardId}] Unable to change stage - not facilitator`);
      return new SocketErrorResponse('FORBIDDEN', 'Only facilitators can change the stage.');
    }
    const newStage = changeStageRequest.stage;

    const board = await this.boardService.getBoard(user.boardId);
    await this.boardService.updateStage(board.id, newStage);

    this.logger.log(`[Board: ${board.id}] Stage changed to: ${newStage}`);
    this.server.to(board.id).emit('board:stage:updated', {
      stage: newStage,
    } as StageChangedEvent);
  }
}
