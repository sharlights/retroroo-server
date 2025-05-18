import { Injectable } from '@nestjs/common';
import { JwtPayload } from 'src/auth/jtw.payload.interface';
import { AuthService } from '../auth/auth.service';


@Injectable()
export class InviteService {
  constructor(private readonly authService: AuthService) {}

  createInviteToken(boardId: string, role: 'facilitator' | 'participant'): string {
    const payload: JwtPayload = {
      sub: 'invite-' + Math.random().toString(36).substring(2, 10),
      boardId,
      role,
    };
    return this.authService.signPayload(payload);
  }
}
