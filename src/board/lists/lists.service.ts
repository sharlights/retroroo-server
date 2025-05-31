import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DeleteListDto } from './dto/list.dto';
import { CreateCardDto, DeleteCardDto, UpdateCardDto, MoveCardDto } from './dto/card.dto';
import { RetroList } from './model/list.model';
import { JwtPayload } from 'src/auth/jtw.payload.interface';
import { RetroCard } from './model/card.model';
import { User } from '../board.model';
import { BoardService } from '../board.service';

@Injectable()
export class ListsService {
  private readonly logger = new Logger(ListsService.name);
  constructor(private readonly boardService: BoardService) {}

  /**
   * The new list to create.
   * @param newList The new list.
   * @param user The user making the request. This must be a facilitator role.
   */
  createList(newList: RetroList, user: User) {
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
   * @param dto The list to delete.
   * @param user The user making the request.
   */
  deleteList(dto: DeleteListDto, user: User) {
    if (user.role !== 'facilitator' || user.boardId != dto.boardId) throw new ForbiddenException('Invalid Permissions');

    const board = this.boardService.getBoard(user.boardId);
    if (board) {
      const reducedList = board.getLists().filter((l) => l.id !== dto.listId);
      this.boardService.updateBoard(board.getId(), { lists: reducedList });
    }
  }

  /**
   * Creates a new card in a given list.
   * @param cardToCreate the new card.
   * @param user The user creating the card.
   */
  createCard(cardToCreate: CreateCardDto, user: User) {
    const board = this.boardService.getBoard(user.boardId);
    const lists = board.getLists();
    const list = lists.find((l) => l.id === cardToCreate.listId);

    const newCard: RetroCard = {
      id: crypto.randomUUID(),
      creatorId: user.id,
      listId: cardToCreate.listId,
      message: cardToCreate.message,
    };

    list.cards.push(newCard);
    this.logger.log(`[Board: ${board.getId()}] Created card: ${newCard}`);
    return {
      ...newCard,
      clientId: cardToCreate.clientId,
    };
  }

  deleteCard(cardToDelete: DeleteCardDto, user: JwtPayload) {
    const board = this.boardService.getBoard(user.boardId);
    const lists = board.getLists();
    const list = lists.find((l) => l.id === cardToDelete.listId);
    if (!list) throw new NotFoundException('List not found');

    list.cards = list.cards.filter((c) => c.id !== cardToDelete.cardId);
  }

  updateCard(cardToUpdate: UpdateCardDto, user: JwtPayload) {
    const board = this.boardService.getBoard(user.boardId);
    const lists = board.getLists();
    const list = lists.find((l) => l.id === cardToUpdate.listId);
    if (!list) throw new NotFoundException('List not found');

    const card = list?.cards.find((c) => c.id === cardToUpdate.cardId);
    if (card) {
      card.message = cardToUpdate.message;
    }
    return card;
  }

  moveCard(moveDto: MoveCardDto, user: JwtPayload) {
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
