import {
  Controller,
  Get,
  Query,
  Res,
  BadRequestException,
  Post,
  Body,
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

  @Post('magic-link/verify')
  verifyMagicLink(@Body('token') token: string): {
    jwt: string;
    boardId: string;
  } {
    const invite = this.inviteService.verifyInviteToken(token);
    if (!invite) throw new BadRequestException('Invalid or expired link');

    const jwt = this.authService.signPayload({
      sub: 'anonymous-' + Math.random().toString(36).substring(2, 10),
      boardId: invite.boardId,
      role: invite.role,
    });

    return { jwt, boardId: invite.boardId };
  }
}
