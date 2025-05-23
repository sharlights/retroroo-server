import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JwtPayload } from '../auth/jtw.payload.interface';
import { SocketErrorResponse } from './socket.core.messages';
import { BoardService } from '../board/board.service';
import { RetroStage } from '../board/board.model';

interface ChangeStageRequest {
  stage: RetroStage;
}

@WebSocketGateway()
export class StageGateway {
  constructor(private boardService: BoardService) {}

  @SubscribeMessage('board:stage:change')
  async changeStage(@ConnectedSocket() socket: Socket, @MessageBody() changeStageRequest: ChangeStageRequest) {
    const user: JwtPayload = socket.data.user;

    if (!user || user.role != 'facilitator') {
      return new SocketErrorResponse('FORBIDDEN', 'Only facilitators can change the stage.');
    }

    const board = this.boardService.getBoard(user.boardId);
    this.boardService.updateStage(board.getId(), changeStageRequest.stage);

    socket.broadcast.emit('stage-changed', {
      stage: changeStageRequest.stage,
    });
  }
}
