import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PresenceService } from './presence.service';
import { AuthService } from 'src/auth/auth.service';

@WebSocketGateway()
export class PresenceGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly presenceService: PresenceService,
    private authService: AuthService,
  ) {}

  handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;
    const user = this.authService.validateToken(token);

    const count = this.presenceService.addUser(
      user.boardId,
      user.sub,
      client.id,
    );
    this.server
      .to(user.boardId)
      .emit('presence:total:update', { total: count });
  }

  handleDisconnect(client: Socket) {
    const result = this.presenceService.removeUser(client.id);
    if (result) {
      this.server
        .to(result.boardId)
        .emit('presence:total:update', { total: result.count });
    }
  }
}
