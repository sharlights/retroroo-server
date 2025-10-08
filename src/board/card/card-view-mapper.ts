import { Injectable } from '@nestjs/common';
import { RetroCardEntity } from './retro-card.entity';
import { RetroCard } from './retro-card.dto';

@Injectable()
export class CardViewMapper {
  constructor() {}

  public toCardDto(card: RetroCardEntity): RetroCard {
    const votesMap = new Map<string, number>();
    for (const vote of card.votes) {
      votesMap.set(vote.userId, vote.count);
    }

    return {
      id: card.id,
      clientId: card.clientId,
      creatorId: card.creatorId,
      boardId: card.board.id,
      listId: card.list.id,
      message: card.message,
      votes: Object.fromEntries(votesMap),
      orderRank: card.orderRank,
    } as RetroCard;
  }

  public toCardDtos(cards: RetroCardEntity[]): RetroCard[] {
    return cards.map((card) => {
      return this.toCardDto(card);
    });
  }
}
