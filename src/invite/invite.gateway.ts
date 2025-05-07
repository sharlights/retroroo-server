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
import { ConfigService } from '@nestjs/config';

@WebSocketGateway()
export class InviteGateway {
  constructor(
    private readonly inviteService: InviteService,
    private configService: ConfigService,
  ) {}

  @SubscribeMessage('board:invite:create')
  async handleInvite(@ConnectedSocket() socket: Socket) {
    const user: JwtPayload = socket.data.user;

    // Anyone can invite, they only have to be associated to a retrospective.
    if (!user) throw new WsException('Unauthorized');

    const token = this.inviteService.createInviteToken(
      user.boardId,
      'participant',
    );

    const baseUrl = this.configService.get<string>('APP_BASE_URL');
    // Emit back to the facilitator - This link can be shared with anyone. Once they click on the link,
    // it will create a JTW and send them to the correct board.
    socket.emit('board:invite:created', {
      link: `${baseUrl}/magic-link/verify?token=${token}`,
    });
  }
}
