import { ConnectedSocket, SubscribeMessage, WebSocketGateway, WsException } from '@nestjs/websockets';
import { InviteService } from '../board/invite/invite.service';
import { Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { RetroUser } from '../board/board.model';

@WebSocketGateway()
export class InviteGateway {
  private readonly logger = new Logger(InviteGateway.name);
  constructor(private inviteService: InviteService) {}

  @SubscribeMessage('board:invite:token:create')
  async handleInvite(@ConnectedSocket() socket: Socket) {
    const user: RetroUser = socket.data.user;

    // Anyone can invite, they only have to be associated to a retrospective.
    if (!user || user.role != 'facilitator') throw new WsException('Unauthorized');

    const token = this.inviteService.createInviteToken(user.boardId, 'participant');
    this.logger.log(`[Board: ${user.boardId}] Creating invite token`);
    return { invite_token: token };
  }
}
