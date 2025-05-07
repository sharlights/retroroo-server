import {
  Controller,
  Get,
  Query,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { InviteService } from './invite.service';

@Controller('invite')
export class InviteController {
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
