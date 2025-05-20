import {
  ConnectedSocket,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { BoardService } from '../board/board.service';
import { User } from '../board/board.model';

@WebSocketGateway()
export class AuthGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(
    private authService: AuthService,
    private boardService: BoardService,
  ) {}

  /**
   * The handleConnection() method comes from the OnGatewayConnection lifecycle interface in NestJS.
   * It’s automatically called by NestJS when a client first connects to the gateway.
   */
  async handleConnection(socket: Socket) {
    const token = socket.handshake.auth?.token;
    const payload = this.authService.validateToken(token);

    if (!payload) {
      socket.disconnect(); // Invalid token.
      console.error(`[Socket] Disconnected: ${socket.id} - invalid token or sessionId`);
      return;
    }

    socket.setMaxListeners(30);
    socket.join(payload.boardId);
  }

  @SubscribeMessage('board:join')
  async handleJoinBoard(@ConnectedSocket() socket: Socket) {
    const token = socket.handshake.auth?.token;
    const payload = this.authService.validateToken(token);

    // Get or create user
    const users = this.boardService.getUsers(payload.boardId);
    let user = users?.get(payload.sub);

    if (!user) {
      // New user is joining the board!
      user = new User(payload.sub, payload.boardId, payload.role);
      this.boardService.joinBoard(payload.boardId, user);
      const updatedBoard = this.boardService.getBoard(payload.boardId);

      const usersMap = updatedBoard.getUsers();
      const usersObject = Object.fromEntries(
        Array.from(usersMap).map(([id, user]) => [
          id,
          {
            id: user.id,
            boardId: user.boardId,
            role: user.role,
          },
        ]),
      );

      this.server.to(updatedBoard.getId()).emit('board:users:updated', {
        users: usersObject,
      });
    }

    socket.data.user = user;
    console.log(`[Board: ${payload.boardId}] User connected: ${user.id}`);
  }
}
