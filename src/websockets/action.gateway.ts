import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { RetroUser } from '../board/users/retro-user.dto';
import { ActionsService } from '../actions/actions.service';
import { ActionCreateRequest, ActionUpdatedEvent } from './model.dto';
import { RetroActionDto } from '../actions/retroActionDto';

@WebSocketGateway()
export class ActionGateway {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ActionGateway.name);
  constructor(private readonly service: ActionsService) {}

  @SubscribeMessage('action:create')
  async handleCreateAction(@ConnectedSocket() socket: Socket, @MessageBody() request: ActionCreateRequest) {
    this.logger.log('Action create card', request);
    const user: RetroUser = socket.data.user;
    const newAction: RetroActionDto = await this.service.createAction(request.description, user);
    this.server.to(user.boardId).emit('action:created', { action: newAction } as ActionUpdatedEvent);
  }
}
