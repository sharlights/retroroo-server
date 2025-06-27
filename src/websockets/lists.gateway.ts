import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ListsService } from '../board/lists/lists.service';
import { RetroUser } from '../board/board.model';
import { Logger } from '@nestjs/common';
import {
  CreateListRequest,
  DeleteListRequest,
  ListDeletedEvent,
  ListUpdatedEvent,
  UpdateListRequest,
} from './model.dto';

@WebSocketGateway()
export class ListsGateway {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ListsGateway.name);
  constructor(private readonly service: ListsService) {}

  // List Events
  @SubscribeMessage('list:create')
  handleCreateList(@ConnectedSocket() socket: Socket, @MessageBody() request: CreateListRequest) {
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
  handleUpdateList(@ConnectedSocket() socket: Socket, @MessageBody() request: UpdateListRequest) {
    const user: RetroUser = socket.data.user;

    const updatedList = this.service.updateList(
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
  handleDeleteList(@ConnectedSocket() socket: Socket, @MessageBody() request: DeleteListRequest) {
    const user: RetroUser = socket.data.user;
    this.service.deleteList(user.boardId, request.listId, user);
    this.server.to(user.boardId).emit('list:deleted', {
      listId: request.listId,
    } as ListDeletedEvent);
  }

  @SubscribeMessage('lists:get')
  handleGetState(@ConnectedSocket() socket: Socket) {
    const boardId: string = socket.data.boardId;
    this.logger.log(`[Board: ${boardId}] Get Lists`);
    return boardId ? this.service.getBoardLists(boardId) : [];
  }
}
