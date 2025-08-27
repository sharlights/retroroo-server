import { Body, Controller, Logger, Post } from '@nestjs/common';
import { BoardService } from '../board.service';
import { AuthService } from '../../auth/auth.service';
import * as crypto from 'node:crypto';
import { ListsService } from '../lists/lists.service';
import { UserService } from '../users/user.service';
import { RetroBoard } from '../retro-board.dto';
import { RetroUser } from '../users/retro-user.dto';

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

    // Populate board
    if (!joinExistingBoard) {
      await this.populateBoardWithBasicData(board, user);
    }

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

  // This is only temporary until we have a better way to seed data.
  async populateBoardWithBasicData(board: RetroBoard, user: RetroUser) {
    await this.listService.createList(
      {
        title: 'What went well?',
        subtitle: 'Things we are happy about.',
        boardId: board.id,
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
        boardId: board.id,
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
        boardId: board.id,
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
        boardId: board.id,
        order: 4,
        colour: '#FBF6D4',
        cards: [],
      },
      user,
    );
  }
}
