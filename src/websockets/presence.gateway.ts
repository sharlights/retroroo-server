import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PresenceService } from '../board/presence/presence.service';

@WebSocketGateway()
export class PresenceGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly presenceService: PresenceService,
  ) {}

  handleDisconnect(client: Socket) {
    const result = this.presenceService.removeUser(client.id);
    if (result) {
      this.server.to(result.boardId).emit('presence:total:update', { total: result.count });
    }
  }

  @SubscribeMessage('presence:join')
  async handlePresenceJoin(@ConnectedSocket() socket: Socket) {
    const user = socket.data.user;
    const count = this.presenceService.addUser(user.boardId, user.sub, socket.id);
    console.log(`[Board: ${user.boardId}] - presence:total: ${count}`);
    this.server.to(user.boardId).emit('presence:total:update', { total: count });

    return { total: count };
  }
}
