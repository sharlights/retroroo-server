import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JwtPayload } from '../auth/jtw.payload.interface';
import { RetroStage, StageService } from '../stage/stage.service';
import { SocketErrorResponse } from '../core/messaging/socket.core.messages';
import { BoardService } from '../board/board.service';

interface ChangeStageRequest {
  stage: RetroStage;
}

@WebSocketGateway()
export class StageGateway {
  constructor(
    private boardService: BoardService,
    private stageService: StageService,
  ) {}

  @SubscribeMessage('board:stage:change')
  async changeStage(@ConnectedSocket() socket: Socket, @MessageBody() changeStageRequest: ChangeStageRequest) {
    const user: JwtPayload = socket.data.user;

    if (!user || user.role != 'facilitator') {
      return new SocketErrorResponse('FORBIDDEN', 'Only facilitators can change the stage.');
    }

    const board = this.boardService.getBoard(user.boardId);
    this.stageService.setStage(board, changeStageRequest.stage);

    socket.broadcast.emit('stage-changed', {
      stage: changeStageRequest.stage,
    });
  }
}
