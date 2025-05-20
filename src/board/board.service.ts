import { Injectable } from '@nestjs/common';
import { Board } from './board.model';
import { ListsService } from '../lists/lists.service';
import { User } from '../auth/user.interface';

@Injectable()
export class BoardService {
  private boards = new Map<string, Board>();

  constructor(private listService: ListsService) {}

  getBoard(boardId: string): Board {
    if (this.boardExists(boardId)) {
      return this.boards.get(boardId);
    }
    return undefined;
  }

  boardExists(boardId: string): boolean {
    return boardId && this.boards.has(boardId);
  }

  createNewBoard(): Board {
    // Create a new board
    const newBoard: Board = {
      id: crypto.randomUUID(),
      createdDate: new Date().toISOString(),
      lists: [],
      participants: [],
    };

    this.boards.set(newBoard.id, newBoard);

    return newBoard;
  }

  setDefaultTemplate(boardId: string, user: User) {
    // Create basic board
    this.listService.createList(
      {
        title: 'What went well?',
        subtitle: 'Things we are happy about.',
        boardId: boardId,
        order: 1,
        colour: '#c8e6c9',
        cards: [],
      },
      user,
    );
    this.listService.createList(
      {
        title: 'What went less well?',
        subtitle: 'Things we could improve',
        boardId: boardId,
        order: 2,
        colour: '#FAD4D4',
        cards: [],
      },
      user,
    );
    this.listService.createList(
      {
        title: 'What do we want to try next?',
        subtitle: 'Things we could do differently',
        boardId: boardId,
        order: 3,
        colour: '#DDEBFA',
        cards: [],
      },
      user,
    );
    this.listService.createList(
      {
        title: 'What puzzles us?',
        subtitle: 'Unanswered questions we have.',
        boardId: boardId,
        order: 4,
        colour: '#FBF6D4',
        cards: [],
      },
      user,
    );
  }
}
