import { Injectable } from '@nestjs/common';
import { Board } from './board.model';

@Injectable()
export class BoardService {
  private boards = new Map<string, Board>();

  getOrCreateBoard(boardId?: string): Board {
    if (this.boardExists(boardId)) {
      return this.boards.get(boardId);
    }
    // Create a new board
    const newBoard: Board = {
      id: crypto.randomUUID(),
      createdDate: new Date().toISOString(),
      lists: [],
    };
    this.boards.set(newBoard.id, newBoard);
    return newBoard;
  }

  boardExists(boardId: string): boolean {
    return boardId && this.boards.has(boardId);
  }
}
