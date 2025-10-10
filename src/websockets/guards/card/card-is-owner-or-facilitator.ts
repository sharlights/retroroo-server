import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { CardsService } from '../../../board/card/cards.service';
import { Socket } from 'socket.io';
import { RetroUser } from '../../../board/users/retro-user.dto';

@Injectable()
export class CardIsOwnerOrFacilitator implements CanActivate {
  constructor(private readonly cardService: CardsService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const ws = ctx.switchToWs();
    const client = ws.getClient<Socket>();
    const { cardId } = ws.getData<{ cardId: string }>();

    const card = await this.cardService.getCard(cardId);
    const user: RetroUser = client.data?.user;

    if (user) {
      const isOwner = user.id === card.creatorId;
      const isFacilitator = user.role == 'facilitator';

      return isOwner || isFacilitator;
    }
    return false;
  }
}
