import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RetroCardEntity } from '../card/retro-card.entity';
import { RetroUser } from '../users/retro-user.dto';
import { RetroCard } from './retro-card.dto';
import { MoveCardRequest } from '../../websockets/model.dto';
import { RetroListEntity } from '../lists/retro-list.entity';

@Injectable()
export class CardsService {
  private readonly logger = new Logger(CardsService.name);

  constructor(
    @InjectRepository(RetroCardEntity)
    private readonly cardRepo: Repository<RetroCardEntity>,
  ) {}

  async createCard(listId: string, message: string, user: RetroUser, clientId?: string): Promise<RetroCard> {
    const newCard = new RetroCardEntity();
    newCard.clientId = clientId ?? null;
    newCard.creatorId = user.id;
    newCard.message = message;
    newCard.list = { id: listId } as Partial<RetroListEntity> as RetroListEntity;
    newCard.votes = [];

    this.logger.log(`[Board: ${user.boardId}] Card created`);
    await this.cardRepo.save(newCard);
    return this.toCardDto(newCard);
  }

  async deleteCard(cardId: string): Promise<void> {
    await this.cardRepo.delete({
      id: cardId,
    });
  }

  async updateCard(cardId: string, update: Partial<RetroCardEntity>, user: RetroUser): Promise<RetroCard> {
    const card = await this.cardRepo.findOneOrFail({
      where: { id: cardId },
      relations: { list: { board: true } },
    });

    if (card.list.board.id !== user.boardId) {
      throw new NotFoundException('Card not found in your board');
    }

    Object.assign(card, update);
    const saved = await this.cardRepo.save(card);
    return this.toCardDto(saved);
  }

  async moveCard(dto: MoveCardRequest, user: RetroUser): Promise<RetroCard> {
    const card = await this.cardRepo.findOneOrFail({
      where: { id: dto.cardId },
      relations: { list: { board: true } },
    });

    if (card.list.board.id !== user.boardId) {
      throw new NotFoundException('Card not found in your board');
    }

    card.list = { id: dto.toListId } as any; // Cast to satisfy TypeORM
    const saved = await this.cardRepo.save(card);

    return this.toCardDto(saved);
  }

  public toCardDto(card: RetroCardEntity): RetroCard {
    const votesMap = new Map<string, number>();
    for (const vote of card.votes) {
      votesMap.set(vote.userId, vote.count);
    }

    return {
      id: card.id,
      clientId: card.clientId,
      creatorId: card.creatorId,
      listId: card.list.id,
      message: card.message,
      votes: votesMap,
    };
  }

  public toCardDtos(cards: RetroCardEntity[]): RetroCard[] {
    return cards.map((card) => {
      return this.toCardDto(card);
    });
  }
}
