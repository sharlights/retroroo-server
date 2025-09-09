import { Body, Controller, Logger, Post } from '@nestjs/common';
import { BoardService } from '../board.service';
import { AuthService } from '../../auth/auth.service';
import * as crypto from 'node:crypto';
import { UserService } from '../users/user.service';
import { RetroBoard } from '../retro-board.dto';

@Controller()
export class RegisterController {
  private readonly logger = new Logger(RegisterController.name);

  constructor(
    private boardService: BoardService,
    private authService: AuthService,
    private userService: UserService,
  ) {}

  /**
   * Registers to either an existing retro board or a new board.
   *
   * To register to an existing board, the user must present the JWT invite.
   */
  @Post('register')
  async joinOrCreateNewBoard(@Body('invite_token') inviteToken: string): Promise<any> {
    const inviteJwt = this.authService.validateToken(inviteToken);
    const joinExistingBoard = inviteJwt;

    let board: RetroBoard;
    if (joinExistingBoard) {
      // Create a new board if the user is not joining through an invite link.
      board = await this.boardService.getBoard(inviteJwt.boardId);
      this.logger.log(`[Board - ${board.id}]: Invite Token Used - User: ${inviteJwt.sub}`);
    } else {
      // Create a new board
      board = await this.boardService.createNewBoard();
    }

    const role = !joinExistingBoard ? 'facilitator' : 'participant';
    const user = await this.userService.createUser(board.id, crypto.randomUUID(), role);

    const token = this.authService.signPayload({
      sub: user.id,
      boardId: user.boardId,
      role: user.role,
    });

    return {
      board: board,
      user: user,
      token,
    };
  }
}
