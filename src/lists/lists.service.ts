import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DeleteListDto } from './dto/list.dto';
import {
  CreateCardDto,
  DeleteCardDto,
  UpdateCardDto,
  MoveCardDto,
} from './dto/card.dto';
import { RetroList } from './model/list.model';
import { JwtPayload } from 'src/auth/jtw.payload.interface';
import { RetroCard } from './model/card.model';

@Injectable()
export class ListsService {
  private lists = new Map<string, RetroList[]>(); // boardId → lists

  /**
   * The new list to create.
   * @param newList The new list.
   * @param user The user making the request.
   */
  createList(newList: RetroList, user: JwtPayload) {
    if (user.role !== 'facilitator' || user.boardId != newList.boardId)
      throw new ForbiddenException('Invalid Permissions');

    const listClone: RetroList = { ...newList };
    listClone.id = crypto.randomUUID();

    // Push the list clone into the existing list.
    const boardLists = this.lists.get(user.boardId) || [];
    boardLists.push(listClone);

    this.lists.set(user.boardId, boardLists);
    return newList;
  }

  updateList(listToUpdate: Partial<RetroList>, user: JwtPayload): RetroList {
    if (user.role !== 'facilitator' || user.boardId != listToUpdate.boardId)
      throw new ForbiddenException('Invalid Permissions');

    const lists = this.lists.get(user.boardId);
    if (!lists) throw new NotFoundException('Board not found');

    const list = lists.find((l) => l.id === listToUpdate.id);
    if (!list) throw new NotFoundException('List not found');

    if (listToUpdate.title) list.title = listToUpdate.title;
    if (listToUpdate.subtitle) list.subtitle = listToUpdate.subtitle;
    if (listToUpdate.order !== undefined) list.order = listToUpdate.order;
    if (listToUpdate.colour) list.colour = listToUpdate.colour;
    return list;
  }

  /**
   * Delete a list in a board.
   * @param dto The list to delete.
   * @param user The user making the request.
   */
  deleteList(dto: DeleteListDto, user: JwtPayload) {
    if (user.role !== 'facilitator' || user.boardId != dto.boardId)
      throw new ForbiddenException('Invalid Permissions');

    const listsInBoard = this.lists.get(dto.boardId);

    if (listsInBoard) {
      this.lists.set(
        dto.boardId,
        listsInBoard.filter((l) => l.id !== dto.listId),
      );
    }
  }

  /**
   * Creates a new card in a given list.
   * @param cardToCreate the new card.
   * @param user The user creating the card.
   */
  createCard(cardToCreate: CreateCardDto, user: JwtPayload) {
    const lists = this.lists.get(user.boardId) || [];
    const list = lists.find((l) => l.id === cardToCreate.listId);
    if (!list) throw new NotFoundException('List not found');

    const newCard: RetroCard = {
      id: crypto.randomUUID(),
      listId: cardToCreate.listId,
      message: cardToCreate.message,
    };

    list.cards.push(newCard);

    return {
      ...newCard,
      clientId: cardToCreate.clientId,
    };
  }

  deleteCard(cardToDelete: DeleteCardDto, user: JwtPayload) {
    const lists = this.lists.get(user.boardId) || [];
    const list = lists.find((l) => l.id === cardToDelete.listId);
    if (!list) throw new NotFoundException('List not found');

    list.cards = list.cards.filter((c) => c.id !== cardToDelete.cardId);
  }

  updateCard(cardToUpdate: UpdateCardDto, user: JwtPayload) {
    const lists = this.lists.get(user.boardId) || [];
    const list = lists.find((l) => l.id === cardToUpdate.listId);
    if (!list) throw new NotFoundException('List not found');

    const card = list?.cards.find((c) => c.id === cardToUpdate.cardId);
    if (card) {
      card.message = cardToUpdate.message;
    }
    return card;
  }

  moveCard(moveDto: MoveCardDto, user: JwtPayload) {
    const lists = this.lists.get(user.boardId) || [];
    const fromList = lists.find((l) => l.id === moveDto.fromListId);
    if (!fromList) throw new NotFoundException('From List not found');
    const toList = lists.find((l) => l.id === moveDto.toListId);
    if (!toList) throw new NotFoundException('To List not found');

    if (!fromList || !toList) return null;

    const cardIndex = fromList.cards.findIndex((c) => c.id === moveDto.cardId);
    if (cardIndex === -1) throw new NotFoundException('Card not found');

    const [card] = fromList.cards.splice(cardIndex, 1);

    const insertAt = Math.max(
      0,
      Math.min(moveDto.targetIndex, toList.cards.length),
    );
    toList.cards.splice(insertAt, 0, card);

    return { ...card, toListId: moveDto.toListId, newIndex: insertAt };
  }

  getBoardLists(boardId: string, user: JwtPayload) {
    if (user.boardId != boardId)
      throw new ForbiddenException('Invalid Permissions');

    return this.lists.get(boardId) || [];
  }
}
