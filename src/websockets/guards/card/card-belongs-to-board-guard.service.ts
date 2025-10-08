import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { CardsService } from '../../../board/card/cards.service';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class CardBelongsToBoardGuard implements CanActivate {
  constructor(private readonly cardService: CardsService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const ws = ctx.switchToWs();
    const client = ws.getClient<Socket>();
    const { cardId } = ws.getData<{ cardId: string }>();

    const card = await this.cardService.getCard(cardId);
    const user = client.data?.user as { boardId?: string } | undefined;

    if (!user) throw new WsException('Unauthorized');

    // Card must exist and belong to the user's board.
    if (!card || card.boardId !== user.boardId) {
      throw new Error('Card not found in your board');
    }

    return true;
  }
}
