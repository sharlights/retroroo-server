import { Injectable, Logger } from '@nestjs/common';
import { BoardService } from '../board.service';
import { Board, BoardRole, RetroUser } from '../board.model';
import { NotFoundError } from 'rxjs';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(private readonly boardService: BoardService) {}

  public createUser(boardId: string, userId: string, role: BoardRole): RetroUser {
    return {
      id: userId,
      boardId: boardId,
      role: role,
    } as RetroUser;
  }

  getUsers(boardId: string): Map<string, RetroUser> | undefined {
    return this.boardService.getBoard(boardId)?.getUsers();
  }

  getUser(boardId: string, userId: string): RetroUser | undefined {
    if (!userId) {
      throw new NotFoundError(`User with id ${boardId} not found.`);
    }
    return this.boardService.getBoard(boardId)?.getUsers().get(userId);
  }

  /**
   * Attempts to join the user to the board. The user must not already be connected.
   * @param boardId The board.
   * @param user The user being added to the board.
   */
  joinBoard(boardId: string, user: RetroUser): Board {
    const board = this.boardService.getBoard(boardId);
    board?.getUsers().set(user.id, user);
    this.logger.log(`[Board: ${board.getId()}] User Joined: ${user.id}`);
    this.boardService.updateBoard(boardId, { users: board.getUsers() });
    return board.clone();
  }

  leaveBoard(boardId: string, user: RetroUser) {
    const board = this.boardService.getBoard(boardId);
    board.getUsers().delete(user.id);
  }
}
