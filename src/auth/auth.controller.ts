import {
  Controller,
  Get,
  Query,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { InviteService } from '../invite/invite.service';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly inviteService: InviteService,
    private readonly authService: AuthService,
  ) {}

  @Get('magic-link/verify')
  verifyMagicLink(@Query('token') token: string, @Res() res: Response) {
    const invite = this.inviteService.verifyInviteToken(token);
    if (!invite) throw new BadRequestException('Invalid or expired link');

    const jwt = this.authService.signPayload({
      sub: 'anonymous-' + Math.random().toString(36).substring(2, 10),
      boardId: invite.boardId,
      role: invite.role,
    });

    // Redirect with JWT (or return directly)
    return res.redirect(`/retro?jwt=${jwt}`);
  }
}
