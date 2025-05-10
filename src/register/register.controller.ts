import { Body, Controller, Post } from '@nestjs/common';
import { BoardService } from '../board/board.service';
import { AuthService } from '../auth/auth.service';

@Controller()
export class RegisterController {
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
  register(@Body('invite_token') inviteToken: string): any {
    // Get the auth token from the post.
    const inviteJwt = this.authService.validateToken(inviteToken);
    const isNewBoard = !inviteJwt;

    const boardId = isNewBoard ? this.boardService.createNewBoard().id : inviteJwt.boardId;
    const role = isNewBoard ? 'facilitator' : 'participant';
    const user = this.authService.createUser(boardId, role);

    if (isNewBoard) {
      this.boardService.setDefaultTemplate(boardId, user);
    }

    const token = this.authService.signPayload({
      sub: user.id,
      boardId: user.boardId,
      role: user.role,
    });

    return {
      boardId: user.id,
      token,
    };
  }
}
