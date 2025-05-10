import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from './auth.service';
import { User } from './user.interface';

@WebSocketGateway()
export class AuthGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly authService: AuthService) {}

  handleDisconnect(socket: Socket) {
    const user = socket.data.user;
    console.log(`[Socket] Disconnected: ${socket.id}`, user ? `User: ${user.sub}` : '');
  }

  /**
   * The handleConnection() method comes from the OnGatewayConnection lifecycle interface in NestJS.
   * It’s automatically called by NestJS when a client first connects to the gateway.
   */
  async handleConnection(socket: Socket) {
    const token = socket.handshake.auth?.token;
    const payload = this.authService.validateToken(token);

    const user = this.authService.getUser(payload.sub);
    if (!user) {
      socket.disconnect(); // Invalid token.
      console.error(`[Socket] Disconnected: ${socket.id} - unable to find user`);
      return;
    }

    // Join the room associated to the JTW token.
    socket.data.user = user as User;
    socket.join(payload.boardId);
    console.log(
      `[Socket] Connected : ${socket.id}`,
      user ? `User: ${user.id}` : '',
      user ? `Board: ${user.boardId}` : '',
    );
    console.log('User %s connected to board: ', user.id, payload.boardId);
  }
}
