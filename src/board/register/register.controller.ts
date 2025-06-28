import { Body, Controller, Logger, Post } from '@nestjs/common';
import { BoardService } from '../board.service';
import { AuthService } from '../../auth/auth.service';
import * as crypto from 'node:crypto';
import { ListsService } from '../lists/lists.service';
import { UserService } from '../users/user.service';

@Controller()
export class RegisterController {
  private readonly logger = new Logger(RegisterController.name);

  constructor(
    private boardService: BoardService,
    private authService: AuthService,
    private listService: ListsService,
    private userService: UserService,
  ) {}

  /**
   * Registers to either an existing retro board or a new board.
   *
   * To register to an existing board, the user must present the JWT invite.
   */
  @Post('register')
  async joinOrCreateNewBoard(@Body('invite_token') inviteToken: string): Promise<any> {
    // Get the auth token from the post.
    const inviteJwt = this.authService.validateToken(inviteToken);
    const createNewBoard = !inviteJwt;

    const boardId = createNewBoard ? (await this.boardService.createNewBoard()).id : inviteJwt.boardId;
    const role = createNewBoard ? 'facilitator' : 'participant';

    const user = await this.userService.createUser(boardId, crypto.randomUUID(), role);

    if (createNewBoard) {
      // Create basic board
      await this.listService.createList(
        {
          title: 'What went well?',
          subtitle: 'Things we are happy about.',
          boardId: boardId,
          order: 1,
          colour: '#c8e6c9',
          cards: [],
        },
        user,
      );
      await this.listService.createList(
        {
          title: 'What went less well?',
          subtitle: 'Things we could improve',
          boardId: boardId,
          order: 2,
          colour: '#FAD4D4',
          cards: [],
        },
        user,
      );
      await this.listService.createList(
        {
          title: 'What do we want to try next?',
          subtitle: 'Things we could do differently',
          boardId: boardId,
          order: 3,
          colour: '#DDEBFA',
          cards: [],
        },
        user,
      );
      await this.listService.createList(
        {
          title: 'What puzzles us?',
          subtitle: 'Unanswered questions we have.',
          boardId: boardId,
          order: 4,
          colour: '#FBF6D4',
          cards: [],
        },
        user,
      );
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
      user: user,
      token,
    };
  }
}
