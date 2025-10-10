import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { BoardService } from '../../board/board.service';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class BoardExistsAndUserIsConnected implements CanActivate {
  constructor(private readonly boardService: BoardService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const ws = ctx.switchToWs();
    const client = ws.getClient<Socket>();
    const user = client.data?.user as { boardId?: string } | undefined;

    if (!user) throw new WsException('Unauthorized');

    const exists = await this.boardService.getBoard(user.boardId);
    if (!exists) throw new WsException('Board not found');

    return true;
  }
}
