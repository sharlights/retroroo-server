import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';
import { AuthService } from './auth.service';
import { JwtPayload } from './jtw.payload.interface';
import { User } from './user.interface';

@WebSocketGateway()
export class BoardGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(private readonly authService: AuthService) {}

  /**
   * The handleConnection() method comes from the OnGatewayConnection lifecycle interface in NestJS.
   * It’s automatically called by NestJS when a client first connects to the gateway.
   */
  async handleConnection(socket: Socket) {
    const token = socket.handshake.auth?.token;
    const payload = this.authService.validateToken(token);

    const user = this.authService.getUser(payload.boardId, payload.sub);
    if (!user) {
      // Invalid token.
      socket.disconnect();
      throw new WsException('Unauthorized');
    }

    // Join the room associated to the JTW token.
    socket.data.user = user as User;
    socket.join(payload.boardId);
  }

  @SubscribeMessage('board:connect')
  handleBoardConnect(@ConnectedSocket() socket: Socket) {
    const user = socket.data.user;
    if (!user) throw new WsException('Unauthorized');
    return { boardId: user.boardId, userId: user.sub, role: user.role };
  }
}
