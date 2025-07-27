import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { RetroUser } from '../board/users/retro-user.dto';
import { DecisionCreateRequest, DecisionUpdatedEvent } from './model.dto';
import { RetroActionDto } from '../actions/retroActionDto';
import { DecisionService } from '../decision/decision.service';

@WebSocketGateway()
export class DecisionGateway {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(DecisionGateway.name);
  constructor(private readonly service: DecisionService) {}

  @SubscribeMessage('decision:create')
  async handleCreateAction(@ConnectedSocket() socket: Socket, @MessageBody() request: DecisionCreateRequest) {
    this.logger.log('decision created', request);
    const user: RetroUser = socket.data.user;
    const newDecision: RetroActionDto = await this.service.createDecision(request.description, user);
    this.server.to(user.boardId).emit('decision:created', { decision: newDecision } as DecisionUpdatedEvent);
  }
}
