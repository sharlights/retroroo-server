import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ListsService } from './lists.service';
import { CreateListDto, UpdateListDto, DeleteListDto } from './dto/list.dto';
import {
  CreateCardDto,
  DeleteCardDto,
  UpdateCardDto,
  MoveCardDto,
} from './dto/card.dto';
import { JwtPayload } from '../auth/jtw.payload.interface';

@WebSocketGateway()
export class ListsGateway {
  @WebSocketServer() server: Server;

  constructor(private readonly service: ListsService) {}

  // List Events
  @SubscribeMessage('list:create')
  handleCreateList(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: CreateListDto,
  ) {
    const user: JwtPayload = socket.data.user;
    const list = this.service.createList(
      {
        title: dto.title,
        subtitle: dto.subtitle,
        boardId: dto.boardId,
        order: dto.order,
        colour: dto.colour,
        cards: [],
      },
      user,
    );
    this.server.to(dto.boardId).emit('list:created', list);
  }

  @SubscribeMessage('list:update')
  handleUpdateList(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: UpdateListDto,
  ) {
    const user: JwtPayload = socket.data.user;

    const result = this.service.updateList(
      {
        id: dto.listId,
        title: dto.title,
        subtitle: dto.subtitle,
        boardId: user.boardId,
        order: dto.order,
        colour: dto.colour,
      },
      user,
    );
    this.server.to(dto.boardId).emit('list:updated', result);
  }

  @SubscribeMessage('list:delete')
  handleDeleteList(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: DeleteListDto,
  ) {
    const user: JwtPayload = socket.data.user;
    this.service.deleteList(dto, user);
    this.server.to(dto.boardId).emit('list:deleted', dto.listId);
  }

  // Card Events
  @SubscribeMessage('list:card:create')
  handleCreateCard(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: CreateCardDto,
  ) {
    console.log('at create event');
    const user: JwtPayload = socket.data.user;
    console.log('user:', user);
    const card = this.service.createCard(dto, user);
    this.server.to(user.boardId).emit('list:card:created', card);
  }

  // Initial State
  @SubscribeMessage('lists:get')
  handleGetState(
    @ConnectedSocket() socket: Socket,
    @MessageBody() boardId: string,
  ) {
    const user: JwtPayload = socket.data.user;
    return this.service.getBoardLists(boardId, user);
  }

  @SubscribeMessage('list:card:delete')
  handleDeleteCard(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: DeleteCardDto,
  ) {
    const user: JwtPayload = socket.data.user;
    this.service.deleteCard(dto, user);
    this.server.to(user.boardId).emit('list:card:deleted', dto.cardId);
  }

  @SubscribeMessage('list:card:update')
  handleUpdateCard(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: UpdateCardDto,
  ) {
    const user: JwtPayload = socket.data.user;
    const card = this.service.updateCard(dto, user);
    this.server.to(user.boardId).emit('list:card:edited', card);
  }

  @SubscribeMessage('list:card:move')
  handleMoveCard(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: MoveCardDto,
  ) {
    const user: JwtPayload = socket.data.user;
    const card = this.service.moveCard(dto, user);
    this.server.to(user.boardId).emit('list:card:moved', card);
  }
}
