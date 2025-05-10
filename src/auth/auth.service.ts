import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jtw.payload.interface';
import { User } from './user.interface';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  private users: Map<string, Map<string, User>> = new Map<string, Map<string, User>>(); // boardId -> map<userId, User>

  validateToken(token: string): JwtPayload | null {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch {
      return null;
    }
  }

  signPayload(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }

  /**
   * Creates a new user and adds them to the board.
   * @param boardId The board.
   * @param role The user role.
   */
  createUser(boardId: string, role: 'facilitator' | 'participant'): User {
    const newUser = {
      id: crypto.randomUUID(),
      boardId: boardId,
      role,
    };

    let usersInBoard = this.users.get(boardId);
    if (!usersInBoard) {
      // Create new user board if it doesn't exist.
      usersInBoard = new Map<string, User>();
      this.users.set(boardId, usersInBoard);
    }

    usersInBoard.set(newUser.id, newUser);
    return newUser;
  }

  getUser(boardId: string, sub: string): User {
    const boardUsers = this.users.get(boardId);
    return boardUsers.get(sub);
  }
}
