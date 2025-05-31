import { Injectable, Logger } from '@nestjs/common';
import { Board, RetroStage, User } from './board.model';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RetroList } from './lists/model/list.model';

/**
 * This service manages the state transition between multiple stages. A stage is a stepping stone the users
 * will take as they continue on their retrospective journey. These stages can include:
 *
 * - Headspace (Icebreaker / Mindfulness)
 * The objective here is to select a small activity to place the participants in a certain state of mind.
 * This could be anything from reflective, safe, peaceful, stress-free, aware, self-reflective.
 * - Explore
 * The objective here is to analyse and explore the possible way of iterating the team to discover or continue success.
 * - Vote
 * The objective here is to vote on issues to collectively agree on the focus of the conversation.
 * - Discuss
 * The objective here is for participants to traverse through the ordered list of cards to analyse the most important
 * focus.
 * - Done
 * A complete overview of the retrospective, allowing the facilitator to export the retrospective in a PDF.
 */
@Injectable()
export class BoardService {
  private boards = new Map<string, Board>();
  private readonly logger = new Logger(BoardService.name);

  constructor(private eventEmitter: EventEmitter2) {}

  /**
   * Fetches the board from the given identifier.
   * @param boardId The identifier.
   */
  getBoard(boardId: string): Board {
    if (this.boardExists(boardId)) {
      return this.boards.get(boardId).clone();
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
    const newBoard = new Board(crypto.randomUUID(), new Date().toISOString(), [], new Map<string, User>(), 'explore');
    this.boards.set(newBoard.getId(), newBoard);
    this.logger.log(`[Board: ${newBoard.getId()}] Created`);
    return newBoard.clone();
  }

  /**
   * Attempts to join the user to the board. The user must not already be connected.
   * @param boardId The board.
   * @param user The user being added to the board.
   */
  joinBoard(boardId: string, user: User): Board {
    const board = this.boards.get(boardId);
    board?.getUsers().set(user.id, user);
    return board.clone();
  }

  getUsers(boardId: string): Map<string, User> | undefined {
    return this.boards.get(boardId)?.getUsers();
  }

  getUser(boardId: string, userId: string): User | undefined {
    return this.boards.get(boardId)?.getUsers().get(userId);
  }

  leaveBoard(boardId: string, user: User) {
    const board = this.boards.get(boardId);
    board.getUsers().delete(user.id);
  }

  updateStage(boardId: string, stage: RetroStage) {
    const board = this.getBoard(boardId);
    const updatedBoard = board.cloneWith({ stage: stage });
    this.eventEmitter.emit('stage.changed', { stage: updatedBoard.getStage() });
  }

  updateBoard(
    boardId: string,
    updates: Partial<{
      id: string;
      createdDate: string;
      lists: RetroList[];
      users: Map<string, User>;
      stage: RetroStage;
    }>,
  ): Board {
    const currentBoard = this.boards.get(boardId);
    if (!currentBoard) {
      this.logger.warn(`Cannot update. Board ${boardId} does not exist.`);
      return undefined;
    }

    const updatedBoard = currentBoard.cloneWith(updates);
    this.boards.set(boardId, updatedBoard);
    this.logger.log(`[Board: ${boardId}] Updated`);
    return updatedBoard;
  }
}
