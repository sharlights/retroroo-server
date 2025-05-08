import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsException,
} from '@nestjs/websockets';
import { InviteService } from './invite.service';
import { Socket } from 'socket.io';
import { JwtPayload } from '../auth/jtw.payload.interface';

@WebSocketGateway()
export class InviteGateway {
  constructor(private inviteService: InviteService) {}

  @SubscribeMessage('board:invite:token:create')
  async handleInvite(@ConnectedSocket() socket: Socket) {
    const user: JwtPayload = socket.data.user;

    // Anyone can invite, they only have to be associated to a retrospective.
    if (!user || user.role != 'facilitator')
      throw new WsException('Unauthorized');

    const token = this.inviteService.createInviteToken(
      user.boardId,
      'participant',
    );
    return { invite_token: token };
  }
}
