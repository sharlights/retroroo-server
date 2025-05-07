import { Controller, Post } from '@nestjs/common';
import { BoardService } from './board.service';
import { AuthService } from '../auth/auth.service';
import { ListsService } from '../lists/lists.service';
import { JwtPayload } from '../auth/jtw.payload.interface';

@Controller('board')
export class BoardController {
  constructor(
    private boardService: BoardService,
    private authService: AuthService,
    private listService: ListsService,
  ) {}

  @Post('new')
  createNewBoard() {
    const board = this.boardService.getOrCreateBoard();

    const user: JwtPayload = {
      sub: 'anonymous-' + Math.random().toString(36).substring(2, 10),
      boardId: board.id,
      role: 'facilitator',
    };

    // Create basic board
    this.listService.createList(
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
    this.listService.createList(
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
    this.listService.createList(
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
    this.listService.createList(
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
    return { boardId: board.id, token: this.authService.signPayload(user) };
  }
}
