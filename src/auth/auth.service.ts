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
    const usersInBoard = this.users.get(boardId) || new Map<string, User>();
    if (!usersInBoard.has(newUser.id)) {
      usersInBoard.set(newUser.id, newUser);
    }
    return newUser;
  }

  createJtwPayload(user: User): JwtPayload {
    return {
      sub: user.id,
      role: user.role,
      boardId: user.boardId,
    };
  }

  getUser(boardId: string, sub: string): User {
    const boardUsers = this.users.get(boardId);
    return boardUsers.get(sub);
  }
}
