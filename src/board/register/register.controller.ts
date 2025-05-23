import { Body, Controller, Logger, Post } from '@nestjs/common';
import { BoardService } from '../board.service';
import { AuthService } from '../../auth/auth.service';
import * as crypto from 'node:crypto';
import { User } from '../board.model';

@Controller()
export class RegisterController {

  private readonly logger = new Logger(RegisterController.name);

  constructor(
    private boardService: BoardService,
    private authService: AuthService,
  ) {}

  /**
   * Registers to either an existing retro board or a new board.
   *
   * To register to an existing board, the user must present the JWT invite.
   */
  @Post('register')
  joinOrCreateNewBoard(@Body('invite_token') inviteToken: string): any {
    // Get the auth token from the post.
    const inviteJwt = this.authService.validateToken(inviteToken);
    const createNewBoard = !inviteJwt;

    const boardId = createNewBoard ? this.boardService.createNewBoard().getId() : inviteJwt.boardId;
    const role = createNewBoard ? 'facilitator' : 'participant';
    const user = new User(crypto.randomUUID(), boardId, role);

    if (createNewBoard) {
      this.boardService.setDefaultTemplate(boardId, user);
    } else {
      this.logger.log(`[Board - ${boardId}]: Invite Token Used - User: ${user.id}`);
    }

    const token = this.authService.signPayload({
      sub: user.id,
      boardId: user.boardId,
      role: user.role,
    });

    return {
      boardId: user.boardId,
      token,
    };
  }
}
