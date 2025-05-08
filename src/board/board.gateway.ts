import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BoardService } from './board.service';
import { WsException } from '@nestjs/websockets';
import { AuthService } from '../auth/auth.service';
import { JwtPayload } from '../auth/jtw.payload.interface';

@WebSocketGateway()
export class BoardGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(
    private readonly boardService: BoardService,
    private readonly authService: AuthService,
  ) {}

  /**
   * The handleConnection() method comes from the OnGatewayConnection lifecycle interface in NestJS.
   * It’s automatically called by NestJS when a client first connects to the gateway.
   */
  async handleConnection(socket: Socket) {
    const token = socket.handshake.auth?.token;
    const user = this.authService.validateToken(token);

    if (!user || !user.boardId) {
      // Invalid token.
      socket.disconnect();
      throw new WsException('Unauthorized');
    }

    // Join the room associated to the JTW token.
    socket.data.user = user as JwtPayload;
    socket.join(user.boardId);
  }

  @SubscribeMessage('board:connect')
  handleBoardConnect(@ConnectedSocket() socket: Socket) {
    const user = socket.data.user;
    if (!user) throw new WsException('Unauthorized');
    return { boardId: user.boardId, userId: user.sub, role: user.role };
  }
}
