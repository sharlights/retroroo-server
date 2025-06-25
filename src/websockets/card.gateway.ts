import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ListsService } from '../board/lists/lists.service';
import { JwtPayload } from '../auth/jtw.payload.interface';
import { RetroUser } from '../board/board.model';
import { Logger } from '@nestjs/common';
import {
  CardCreatedEvent,
  CardDeletedEvent,
  CardMovedEvent,
  CardUpdatedEvent,
  CreateCardRequest,
  DeleteCardRequest,
  MoveCardRequest,
  UnvoteForCardRequest,
  UpdateCardRequest,
  VoteForCardRequest,
} from './model.dto';
import { UserService } from '../board/users/user.service';

@WebSocketGateway()
export class CardGateway {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(CardGateway.name);
  constructor(
    private readonly service: ListsService,
    private readonly userService: UserService,
  ) {}

  @SubscribeMessage('list:card:create')
  handleCreateCard(@ConnectedSocket() socket: Socket, @MessageBody() request: CreateCardRequest) {
    const user: RetroUser = socket.data.user;
    const card = this.service.createCard(request.listId, request.clientId, request.message, user);
    this.server.to(user.boardId).emit('list:card:created', { card: card } as CardCreatedEvent);
  }

  @SubscribeMessage('list:card:delete')
  handleDeleteCard(@ConnectedSocket() socket: Socket, @MessageBody() request: DeleteCardRequest) {
    const user: JwtPayload = socket.data.user;
    this.service.deleteCard(request, user);
    this.server.to(user.boardId).emit('list:card:deleted', {
      cardId: request.cardId,
    } as CardDeletedEvent);
  }

  @SubscribeMessage('list:card:update')
  handleUpdateCard(@ConnectedSocket() socket: Socket, @MessageBody() request: UpdateCardRequest) {
    const user: JwtPayload = socket.data.user;
    const card = this.service.updateCard(request.cardId, { message: request.message }, user);
    this.server.to(user.boardId).emit('list:card:updated', {
      card: card,
    } as CardUpdatedEvent);
  }

  @SubscribeMessage('list:card:move')
  handleMoveCard(@ConnectedSocket() socket: Socket, @MessageBody() request: MoveCardRequest) {
    const user: JwtPayload = socket.data.user;
    const card = this.service.moveCard(request, user);
    this.server.to(user.boardId).emit('list:card:moved', {
      cardId: card.id,
      fromListId: request.fromListId,
      toListId: request.toListId,
      newListIndex: request.targetIndex,
    } as CardMovedEvent);
  }

  @SubscribeMessage('list:card:vote')
  async handleVoteFor(@ConnectedSocket() socket: Socket, @MessageBody() request: VoteForCardRequest) {
    const jwt: JwtPayload = socket.data.user;
    const user: RetroUser = this.userService.getUser(jwt.boardId, jwt.sub);
    const card = await this.service.upvoteCard(request.cardId, user);

    this.server.to(user.boardId).emit('list:card:updated', {
      card: card,
    });
  }

  @SubscribeMessage('list:card:unvote')
  async handleUnvoteFor(@ConnectedSocket() socket: Socket, @MessageBody() request: UnvoteForCardRequest) {
    const jwt: JwtPayload = socket.data.user;
    const user: RetroUser = this.userService.getUser(jwt.boardId, jwt.sub);
    const card = await this.service.downvoteCard(request.cardId, user);

    this.server.to(user.boardId).emit('list:card:updated', {
      card: card,
    });
  }
}
