import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/jtw.payload.interface';

@Injectable()
export class InviteService {
  constructor(private readonly jwtService: JwtService) {}

  createInviteToken(
    boardId: string,
    role: 'facilitator' | 'participant',
  ): string {
    const payload: JwtPayload = {
      sub: 'invite-' + Math.random().toString(36).substring(2, 10),
      boardId,
      role,
    };
    return this.jwtService.sign(payload);
  }

  verifyInviteToken(token: string): JwtPayload | null {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch {
      return null;
    }
  }
}