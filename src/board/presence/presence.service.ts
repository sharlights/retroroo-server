import { Injectable } from '@nestjs/common';

@Injectable()
export class PresenceService {
  private presence = new Map<string, Map<string, Set<string>>>(); // boardId → userId → socketIds

  addUser(boardId: string, userId: string, socketId: string): number {
    if (!this.presence.has(boardId)) {
      this.presence.set(boardId, new Map());
    }

    const board = this.presence.get(boardId)!;
    if (!board.has(userId)) {
      board.set(userId, new Set());
    }

    board.get(userId)!.add(socketId);
    return board.size; // number of unique users
  }

  removeUser(socketId: string): { boardId: string; count: number } | null {
    for (const [boardId, userMap] of this.presence) {
      for (const [userId, sockets] of userMap) {
        if (sockets.delete(socketId)) {
          if (sockets.size === 0) userMap.delete(userId);
          if (userMap.size === 0) this.presence.delete(boardId);
          return { boardId, count: userMap.size };
        }
      }
    }
    return null;
  }

  getUserCount(boardId: string): number {
    return this.presence.get(boardId)?.size || 0;
  }
}