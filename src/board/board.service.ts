import { Injectable, Logger } from '@nestjs/common';
import { Board, User } from './board.model';
import { ListsService } from './lists/lists.service';

@Injectable()
export class BoardService {
  private boards = new Map<string, Board>();
  private readonly logger = new Logger(BoardService.name);

  constructor(private listService: ListsService) {}

  /**
   * Fetches the board from the given identifier.
   * @param boardId The identifier.
   */
  getBoard(boardId: string): Board {
    if (this.boardExists(boardId)) {
      return this.boards.get(boardId);
    } else {
      this.logger.warn(`Unable to find board ${boardId}`);
    }
    return undefined;
  }

  /**
   * Checks if the given board id already exists.
   * @param boardId
   */
  boardExists(boardId: string): boolean {
    return boardId && this.boards.has(boardId);
  }

  /**
   * Creates a fresh new board.
   */
  createNewBoard(): Board {
    const newBoard = new Board(crypto.randomUUID(), new Date().toISOString(), [], new Map<string, User>());
    this.boards.set(newBoard.getId(), newBoard);
    this.logger.log(`[Board: ${newBoard.getId()}] Created`);
    return newBoard;
  }

  /**
   * Attempts to join the user to the board. The user must not already be connected.
   * @param boardId The board.
   * @param user The user being added to the board.
   */
  joinBoard(boardId: string, user: User): void {
    const board = this.boards.get(boardId);
    board?.getUsers().set(user.id, user);
  }

  getUsers(boardId: string): Map<string, User> | undefined {
    return this.boards.get(boardId)?.getUsers();
  }

  getUser(boardId: string, userId: string): User | undefined {
    return this.boards.get(boardId)?.getUsers().get(userId);
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

  leaveBoard(boardId: string, user: User) {
    const board = this.boards.get(boardId);
    board.getUsers().delete(user.id);
  }
}
