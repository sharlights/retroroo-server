import { Injectable } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { DeleteCardDto } from './dto/delete-card.dto';

@Injectable()
export class CardsService {
  private cards = new Map<string, any[]>(); // key: boardId

  createCard(dto: CreateCardDto) {
    const newCard = { id: crypto.randomUUID(), message: dto.message };
    const boardCards = this.cards.get(dto.boardId) || [];
    boardCards.push(newCard);
    this.cards.set(dto.boardId, boardCards);
    return newCard;
  }

  deleteCard(dto: DeleteCardDto) {
    const boardCards = this.cards.get(dto.boardId) || [];
    this.cards.set(
      dto.boardId,
      boardCards.filter((c) => c.id !== dto.cardId),
    );
  }
}
