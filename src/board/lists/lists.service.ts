import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RetroListEntity } from './retro-list.entity';
import { RetroUser } from '../users/retro-user.dto';
import { RetroList } from './retro-list.dto';
import { CardsService } from '../card/cards.service';
import { RetroVoteEntity } from '../card/retro-card-vote.entity';

@Injectable()
export class ListsService {
  private readonly logger = new Logger(ListsService.name);

  constructor(
    @InjectRepository(RetroListEntity)
    private readonly listRepo: Repository<RetroListEntity>,
    private readonly cardsService: CardsService,
  ) {}

  async getBoardLists(boardId: string): Promise<RetroList[]> {
    if (boardId) {
      const entities = await this.listRepo.find({
        where: { board: { id: boardId } },
        relations: ['cards'],
      });
      return entities.map((e) => this.toDto(e));
    }
  }

  async createList(newList: Partial<RetroList>, user: RetroUser): Promise<RetroList> {
    if (user.role !== 'facilitator' || user.boardId !== newList.boardId) {
      throw new ForbiddenException('Invalid Permissions');
    }

    const entity = this.listRepo.create({
      title: newList.title,
      subtitle: newList.subtitle,
      colour: newList.colour,
      order: newList.order,
      board: { id: user.boardId },
      cards: [],
    });

    const saved = await this.listRepo.save(entity);
    return this.toDto(saved);
  }

  async updateList(update: Partial<RetroList>, user: RetroUser): Promise<RetroList> {
    if (user.role !== 'facilitator') throw new ForbiddenException('Invalid Permissions');

    const list = await this.listRepo.findOneOrFail({ where: { id: update.id, board: { id: user.boardId } } });

    // Assign only updatable fields
    if (update.title !== undefined) list.title = update.title;
    if (update.subtitle !== undefined) list.subtitle = update.subtitle;
    if (update.colour !== undefined) list.colour = update.colour;
    if (update.order !== undefined) list.order = update.order;

    const saved = await this.listRepo.save(list);
    return this.toDto(saved);
  }

  async deleteList(boardId: string, listId: string, user: RetroUser): Promise<void> {
    if (user.role !== 'facilitator' || user.boardId !== boardId) throw new ForbiddenException('Invalid Permissions');
    await this.listRepo.delete({ id: listId, board: { id: boardId } });
  }

  private toDto(entity: RetroListEntity): RetroList {
    return {
      id: entity.id,
      title: entity.title,
      subtitle: entity.subtitle,
      colour: entity.colour,
      order: entity.order,
      boardId: entity.board.id,
      cards: entity.cards ? this.cardsService.toCardDtos(entity.cards) : [],
    };
  }

  async upvoteCard(cardId: string, user: RetroUser): Promise<void> {
    const list = await this.listRepo.findOneOrFail({
      where: { board: { id: user.boardId }, cards: { id: cardId } },
      relations: ['cards', 'cards.votes'],
    });

    const card = list.cards.find((c) => c.id === cardId);
    if (!card) throw new NotFoundException('Card not found');

    let vote = card.votes.find((v) => v.userId === user.id);
    if (!vote) {
      vote = { userId: user.id, count: 1 } as RetroVoteEntity;
      card.votes.push(vote);
    } else {
      vote.count++;
    }

    await this.listRepo.save(list);
  }
}
