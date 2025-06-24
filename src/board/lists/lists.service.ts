import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { RetroList } from './model/list.model';
import { JwtPayload } from 'src/auth/jtw.payload.interface';
import { RetroCard } from './model/card.model';
import { RetroUser } from '../board.model';
import { BoardService } from '../board.service';
import * as crypto from 'crypto';
import { DeleteCardRequest, MoveCardRequest } from '../../websockets/model.dto';
import { Mutex } from 'async-mutex';

@Injectable()
export class ListsService {
  private readonly logger = new Logger(ListsService.name);
  private cardLocks: Map<string, Mutex>;

  constructor(private readonly boardService: BoardService) {
    this.cardLocks = new Map<string, Mutex>();
  }

  /**
   * The new list to create.
   * @param newList The new list.
   * @param user The user making the request. This must be a facilitator role.
   */
  createList(newList: RetroList, user: RetroUser) {
    if (user.role !== 'facilitator' || user.boardId != newList.boardId)
      throw new ForbiddenException('Invalid Permissions');

    const listClone: RetroList = { ...newList };
    listClone.id = crypto.randomUUID();

    const board = this.boardService.getBoard(newList.boardId);
    const lists = board.getLists();
    lists.push(listClone);

    // Update the board
    this.boardService.updateBoard(board.getId(), { lists: lists });
    return newList;
  }

  updateList(listToUpdate: Partial<RetroList>, user: JwtPayload): RetroList {
    if (user.role !== 'facilitator' || user.boardId != listToUpdate.boardId)
      throw new ForbiddenException('Invalid Permissions');

    const board = this.boardService.getBoard(user.boardId);
    if (!board) throw new NotFoundException('Board not found');
    const lists = board.getLists();

    const list = lists.find((l) => l.id === listToUpdate.id);
    if (!list) throw new NotFoundException('List not found');

    if (listToUpdate.title) list.title = listToUpdate.title;
    if (listToUpdate.subtitle) list.subtitle = listToUpdate.subtitle;
    if (listToUpdate.order !== undefined) list.order = listToUpdate.order;
    if (listToUpdate.colour) list.colour = listToUpdate.colour;

    this.boardService.updateBoard(board.getId(), { lists: lists });
    return list;
  }

  /**
   * Delete a list in a board.
   * @param boardId The board id.
   * @param listId The list to remove.
   * @param user The user making the request.
   */
  deleteList(boardId: string, listId: string, user: RetroUser) {
    if (user.role !== 'facilitator' || user.boardId != boardId) throw new ForbiddenException('Invalid Permissions');

    const board = this.boardService.getBoard(user.boardId);
    if (board) {
      const reducedList = board.getLists().filter((l) => l.id !== listId);
      this.boardService.updateBoard(board.getId(), { lists: reducedList });
    }
  }

  /**
   * Creates a new card in a given list.
   * @param listId The list to append the card.
   * @param clientId The unique identifier created on the creator's browser before requesting creation.
   * @param message The message contained in the new card.
   * @param creator The creator of the card.
   */
  createCard(listId: string, clientId: string, message: string, creator: RetroUser) {
    const board = this.boardService.getBoard(creator.boardId);
    const lists = board.getLists();
    const list = lists.find((l) => l.id === listId);

    const newCard: RetroCard = {
      id: crypto.randomUUID(),
      creatorId: creator.id,
      listId: listId,
      clientId: clientId,
      message: message,
      votes: new Map<string, number>(),
    };

    list.cards.push(newCard);
    this.logger.log(`[Board: ${board.getId()}] Created card: ${newCard}`);
    return {
      ...newCard,
    };
  }

  deleteCard(cardToDelete: DeleteCardRequest, user: JwtPayload) {
    const board = this.boardService.getBoard(user.boardId);
    const lists = board.getLists();
    const list = lists.find((l) => l.id === cardToDelete.listId);
    if (!list) throw new NotFoundException('List not found');

    list.cards = list.cards.filter((c) => c.id !== cardToDelete.cardId);
  }

  updateCard(cardId: string, cardUpdate: Partial<RetroCard>, user: JwtPayload): RetroCard {
    const board = this.boardService.getBoard(user.boardId);
    const cardToUpdate = this.getCard(cardId, board.getId());

    if (!cardToUpdate) {
      throw new Error('Cannot update card with id "' + cardId + '"');
    }

    if (cardUpdate.message) cardToUpdate.message = cardUpdate.message;

    return cardToUpdate;
  }

  async upvoteCard(cardId: string, user: RetroUser): Promise<RetroCard> {
    const board = this.boardService.getBoard(user.boardId);

    const cardLock = this.cardLocks.get(cardId);
    await cardLock.runExclusive(() => {
      const cardToUpdate = this.getCard(cardId, board.getId());

      if (!cardToUpdate) {
        throw new Error('Card does not exist: "' + cardId + '"');
      }

      const currentVotes: number = cardToUpdate.votes.get(user.id) ?? 0;
      cardToUpdate.votes.set(user.id, currentVotes + 1);
      return cardToUpdate;
    });
    return undefined;
  }

  async downvoteCard(cardId: string, user: RetroUser) {
    const board = this.boardService.getBoard(user.boardId);

    const cardLock = this.cardLocks.get(cardId);
    await cardLock.runExclusive(() => {
      const cardToUpdate = this.getCard(cardId, board.getId());

      if (!cardToUpdate) {
        throw new Error('Card does not exist: "' + cardId + '"');
      }

      const currentVotes: number = cardToUpdate.votes.get(user.id) ?? 0;
      if (currentVotes > 0) {
        cardToUpdate.votes.set(user.id, currentVotes - 1);
      }
    });
  }

  getCard(cardId: string, boardId: string): RetroCard | undefined {
    const board = this.boardService.getBoard(boardId);
    const lists = board.getLists();
    lists.forEach((list: RetroList) => {
      const foundCard = list.cards.filter((c) => c.id !== cardId);
      if (foundCard) {
        return foundCard;
      }
    });
    return undefined;
  }

  moveCard(moveDto: MoveCardRequest, user: JwtPayload) {
    const board = this.boardService.getBoard(user.boardId);
    const lists = board.getLists();

    const fromList = lists.find((l) => l.id === moveDto.fromListId);
    if (!fromList) throw new NotFoundException('From List not found');
    const toList = lists.find((l) => l.id === moveDto.toListId);
    if (!toList) throw new NotFoundException('To List not found');

    if (!fromList || !toList) return null;

    const cardIndex = fromList.cards.findIndex((c) => c.id === moveDto.cardId);
    if (cardIndex === -1) throw new NotFoundException('Card not found');

    const [card] = fromList.cards.splice(cardIndex, 1);

    const insertAt = Math.max(0, Math.min(moveDto.targetIndex, toList.cards.length));
    toList.cards.splice(insertAt, 0, card);

    return { ...card, toListId: moveDto.toListId, newIndex: insertAt };
  }

  /**
   * Fetches the lists for a given boardId. Returns an empty array if the board is not found.
   * @param boardId The board id containing the desired lists.
   */
  getBoardLists(boardId: string): RetroList[] {
    const board = this.boardService.getBoard(boardId);
    return board?.getLists() || [];
  }
}
