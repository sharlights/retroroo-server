import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jtw.payload.interface';
import { User } from './user.interface';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  private users: Map<string, User> = new Map<string, User>(); // boardId -> map<userId, User>

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

    this.users.set(newUser.id, newUser);
    return newUser;
  }

  getUser(sub: string): User {
    return this.users.get(sub);
  }
}
