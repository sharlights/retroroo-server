import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ListsService } from '../board/lists/lists.service';
import { Logger } from '@nestjs/common';
import {
  CreateListRequest,
  DeleteListRequest,
  ListDeletedEvent,
  ListUpdatedEvent,
  UpdateListRequest,
} from './model.dto';
import { RetroUser } from '../board/users/retro-user.dto';

@WebSocketGateway()
export class ListsGateway {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ListsGateway.name);
  constructor(private readonly service: ListsService) {}

  // List Events
  @SubscribeMessage('list:create')
  async handleCreateList(@ConnectedSocket() socket: Socket, @MessageBody() request: CreateListRequest) {
    const user: RetroUser = socket.data.user;
    const list = this.service.createList(
      {
        title: request.title,
        subtitle: request.subtitle,
        boardId: request.boardId,
        order: request.order,
        colour: request.colour,
        cards: [],
      },
      user,
    );
    this.server.to(request.boardId).emit('list:created', list);
  }

  @SubscribeMessage('list:update')
  async handleUpdateList(@ConnectedSocket() socket: Socket, @MessageBody() request: UpdateListRequest) {
    const user: RetroUser = socket.data.user;

    const updatedList = await this.service.updateList(
      {
        id: request.listId,
        title: request.title,
        subtitle: request.subtitle,
        boardId: user.boardId,
        order: request.order,
        colour: request.colour,
      },
      user,
    );
    this.server.to(request.boardId).emit('list:updated', { list: updatedList } as ListUpdatedEvent);
  }

  @SubscribeMessage('list:delete')
  async handleDeleteList(@ConnectedSocket() socket: Socket, @MessageBody() request: DeleteListRequest) {
    const user: RetroUser = socket.data.user;
    await this.service.deleteList(user.boardId, request.listId, user);
    this.server.to(user.boardId).emit('list:deleted', {
      listId: request.listId,
    } as ListDeletedEvent);
  }

  @SubscribeMessage('lists:get')
  async handleGetState(@ConnectedSocket() socket: Socket) {
    const boardId: string = socket.data.boardId;
    this.logger.log(`[Board: ${boardId}] Get Lists`);
    return await this.service.getBoardLists(boardId);
  }
}
