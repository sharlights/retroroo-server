import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { DeleteCardDto } from './dto/delete-card.dto';

@WebSocketGateway({ namespace: '/retro' })
export class CardsGateway {
  @WebSocketServer() server: Server;

  constructor(private readonly cardsService: CardsService) {}

  @SubscribeMessage('card:create')
  handleCreate(
    @MessageBody() data: CreateCardDto,
    @ConnectedSocket() client: Socket,
  ) {
    const card = this.cardsService.createCard(data);
    this.server.to(data.boardId).emit('card:created', card);
  }

  @SubscribeMessage('card:delete')
  handleDelete(
    @MessageBody() data: DeleteCardDto,
    @ConnectedSocket() client: Socket,
  ) {
    this.cardsService.deleteCard(data);
    this.server.to(data.boardId).emit('card:deleted', data.cardId);
  }
}
