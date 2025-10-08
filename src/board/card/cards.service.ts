import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { RetroUser } from '../users/retro-user.dto';
import { RetroCard } from './retro-card.dto';
import { RetroListEntity } from '../lists/retro-list.entity';
import { RetroVoteEntity } from './retro-card-vote.entity';
import { CardViewMapper } from './card-view-mapper';
import { RetroCardEntity } from './retro-card.entity';
import { LexoRank } from 'lexorank';
import { RetroBoardEntity } from '../retro-board.entity';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(RetroCardEntity)
    private readonly cardRepo: Repository<RetroCardEntity>,
    @InjectRepository(RetroVoteEntity)
    private readonly voteRepo: Repository<RetroVoteEntity>,
    private readonly cardViewMapper: CardViewMapper,
  ) {}

  async createCard(listId: string, message: string, user: RetroUser, clientId?: string): Promise<RetroCard> {
    const lastCard = await this.cardRepo.findOne({
      where: { list: { id: listId } },
      order: { orderRank: 'DESC' },
    });

    const newRank = lastCard ? LexoRank.parse(lastCard.orderRank).genNext() : LexoRank.middle();

    // Get the number of cards in the list to set the index
    const newCard = new RetroCardEntity();
    newCard.clientId = clientId ?? null;
    newCard.creatorId = user.id;
    newCard.message = message;
    newCard.board = { id: user.boardId } as RetroBoardEntity;
    newCard.list = { id: listId } as Partial<RetroListEntity> as RetroListEntity;
    newCard.votes = [];
    newCard.orderRank = newRank.toString();
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

  async moveCard(
    cardId: string,
    toListId: string,
    aboveCardId: string,
    belowCardId: string,
    user: RetroUser,
  ): Promise<RetroCard> {
    const card = await this.getCardEntity(cardId);

    // Determine if the card belongs to the board of the user
    if (user.boardId !== card.list.board.id) {
      throw new NotFoundException('Card not found in your board');
    }

    const aboveCard = await this.getCardEntity(aboveCardId);
    const belowCard = await this.getCardEntity(belowCardId);
    const movedCard = await this.moveCardBelow(card, toListId, aboveCard, belowCard);
    return this.cardViewMapper.toCardDto(movedCard);
  }

  private async moveCardBelow(
    card: RetroCardEntity,
    toListId: string,
    aboveCard: RetroCardEntity,
    belowCard: RetroCardEntity | null,
  ): Promise<RetroCardEntity> {
    // no-op if already positioned correctly in same list
    return this.cardRepo.manager.transaction(async (em) => {
      // lock anchors inside the target list

      const lockedAbove = aboveCard ? await this.lockCardInList(em, aboveCard.id, toListId) : null;
      const lockedBelow = belowCard ? await this.lockCardInList(em, belowCard.id, toListId) : null;

      let newRank: string;

      // compute new rank
      if (lockedAbove && lockedBelow) {
        newRank = LexoRank.parse(lockedAbove.orderRank).between(LexoRank.parse(lockedBelow.orderRank)).toString();
      } else if (lockedBelow) {
        newRank = LexoRank.parse(lockedBelow.orderRank).genPrev().toString(); // start
      } else if (lockedAbove) {
        newRank = LexoRank.parse(lockedAbove.orderRank).genNext().toString(); // end
      } else {
        // no anchors → end (or middle if list empty)
        const last = await em
          .createQueryBuilder(RetroCardEntity, 'c')
          .select('c.orderRank', 'orderRank')
          .where('c.listId = :listId', { listId: toListId })
          .andWhere('c.id <> :id', { id: card.id })
          .orderBy('c.orderRank', 'DESC')
          .limit(1)
          .setFindOptions({ loadEagerRelations: false })
          .getRawOne<{ orderRank: string }>();
        newRank = last ? LexoRank.parse(last.orderRank).genNext().toString() : LexoRank.middle().toString();
      }

      // update the moving card
      await em.update(
        RetroCardEntity,
        { id: card.id },
        {
          list: { id: toListId },
          orderRank: newRank.toString(),
        },
      );

      return await em.findOneOrFail(RetroCardEntity, {
        where: { id: card.id },
        relations: { list: { board: true }, board: true, votes: true },
        loadEagerRelations: false,
      });
    });
  }

  private async lockCardInList(em: EntityManager, cardId: string, listId: string) {
    const raw = await em
      .createQueryBuilder(RetroCardEntity, 'c')
      .select('c.id', 'id')
      .addSelect('c.orderRank', 'orderRank')
      .addSelect('c.listId', 'listId')
      .where('c.id = :cardId AND c.listId = :listId', { cardId, listId })
      .setFindOptions({ loadEagerRelations: false })
      .setLock('pessimistic_write')
      .getRawOne<{ id: string; orderRank: string; listId: string }>();

    if (!raw) throw new Error('Card not found in target list');
    if (!raw.orderRank) throw new Error(`Card ${cardId} has no orderRank`);
    return raw;
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

  private async getCardEntity(cardId: string): Promise<RetroCardEntity | null> {
    if (!cardId) {
      return null;
    }

    return await this.cardRepo.findOneOrFail({
      where: { id: cardId },
      relations: { list: { board: true } },
    });
  }

  async getCard(cardId: string): Promise<RetroCard> {
    return this.cardViewMapper.toCardDto(await this.getCardEntity(cardId));
  }
}
