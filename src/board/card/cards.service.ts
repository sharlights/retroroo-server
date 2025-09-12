import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RetroUser } from '../users/retro-user.dto';
import { RetroCard } from './retro-card.dto';
import { MoveCardRequest } from '../../websockets/model.dto';
import { RetroListEntity } from '../lists/retro-list.entity';
import { RetroVoteEntity } from './retro-card-vote.entity';
import { CardViewMapper } from './card-view-mapper';
import { RetroCardEntity } from './retro-card.entity';

@Injectable()
export class CardsService {
  private readonly logger = new Logger(CardsService.name);

  constructor(
    @InjectRepository(RetroCardEntity)
    private readonly cardRepo: Repository<RetroCardEntity>,
    @InjectRepository(RetroVoteEntity)
    private readonly voteRepo: Repository<RetroVoteEntity>,
    private readonly cardViewMapper: CardViewMapper,
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
    return this.cardViewMapper.toCardDto(newCard);
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
    return this.cardViewMapper.toCardDto(saved);
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

    return this.cardViewMapper.toCardDto(saved);
  }

  async saveCardVotes(cardId: string, userId: string, delta: number): Promise<void> {
    let vote = await this.voteRepo.findOne({ where: { card: { id: cardId }, userId } });
    if (!vote) {
      vote = this.voteRepo.create({ userId, card: { id: cardId }, count: 0 });
    }

    vote.count += delta;
    if (vote.count <= 0) {
      vote.count = 0;
    }

    await this.voteRepo.save(vote);
  }

  async getCard(cardId: string): Promise<RetroCard> {
    const card = await this.cardRepo.findOneOrFail({
      where: { id: cardId },
      relations: { list: { board: true } },
    });
    return this.cardViewMapper.toCardDto(card);
  }
}
