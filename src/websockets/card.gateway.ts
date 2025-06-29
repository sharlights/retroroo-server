import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import {
  CardCreatedEvent,
  CardDeletedEvent,
  CardMovedEvent,
  CardUpdatedEvent,
  CreateCardRequest,
  DeleteCardRequest,
  MoveCardRequest,
  UpdateCardRequest,
  VoteForCardRequest,
} from './model.dto';
import { RetroUser } from '../board/users/retro-user.dto';
import { CardsService } from '../board/card/cards.service';

@WebSocketGateway()
export class CardGateway {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(CardGateway.name);
  constructor(private readonly service: CardsService) {}

  @SubscribeMessage('list:card:create')
  async handleCreateCard(@ConnectedSocket() socket: Socket, @MessageBody() request: CreateCardRequest) {
    const user: RetroUser = socket.data.user;
    const card = await this.service.createCard(request.listId, request.message, user, request.clientId);
    this.server.to(user.boardId).emit('list:card:created', { card: card } as CardCreatedEvent);
  }

  @SubscribeMessage('list:card:delete')
  async handleDeleteCard(@ConnectedSocket() socket: Socket, @MessageBody() request: DeleteCardRequest) {
    const user: RetroUser = socket.data.user;
    await this.service.deleteCard(request.cardId);
    this.server.to(user.boardId).emit('list:card:deleted', {
      cardId: request.cardId,
    } as CardDeletedEvent);
  }

  @SubscribeMessage('list:card:update')
  async handleUpdateCard(@ConnectedSocket() socket: Socket, @MessageBody() request: UpdateCardRequest) {
    const user: RetroUser = socket.data.user;
    const card = await this.service.updateCard(request.cardId, { message: request.message }, user);
    this.server.to(user.boardId).emit('list:card:updated', {
      card: card,
    } as CardUpdatedEvent);
  }

  @SubscribeMessage('list:card:move')
  async handleMoveCard(@ConnectedSocket() socket: Socket, @MessageBody() request: MoveCardRequest) {
    const user: RetroUser = socket.data.user;
    const card = await this.service.moveCard(request, user);
    this.server.to(user.boardId).emit('list:card:moved', {
      cardId: card.id,
      fromListId: request.fromListId,
      toListId: request.toListId,
      newListIndex: request.targetIndex,
    } as CardMovedEvent);
  }

  @SubscribeMessage('list:card:vote')
  async handleVoteFor(@ConnectedSocket() socket: Socket, @MessageBody() request: VoteForCardRequest) {
    const user: RetroUser = socket.data.user;
    await this.service.saveCardVotes(request.cardId, user.id, request.voteDelta);

    const updatedCard = await this.service.getCard(request.cardId);
    this.logger.log(`[Board: ${user.boardId}] User ${user.id} voted for card: ${updatedCard.id}`);
    this.server.to(user.boardId).emit('list:card:updated', {
      card: updatedCard,
    } as CardUpdatedEvent);
  }
}
