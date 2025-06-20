import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { BoardService } from '../board/board.service';
import { User } from '../board/board.model';
import { Logger } from '@nestjs/common';

@WebSocketGateway()
export class AuthGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(AuthGateway.name);

  constructor(
    private authService: AuthService,
    private boardService: BoardService,
  ) {}

  handleDisconnect(socket: Socket) {
    const token = socket.handshake.auth?.token;
    const payload = this.authService.validateToken(token);

    const board = this.boardService.getBoard(payload.boardId);

    if (board) {
      const user = this.boardService.getUser(board.getId(), payload.sub);

      this.boardService.leaveBoard(payload.boardId, user);
      const usersInBoard: User[] = [...board.getUsers().values()];

      this.server.to(board.getId()).emit('board:users:updated', {
        users: usersInBoard,
      });

      this.logger.log(`[Board: ${payload.boardId}] User disconnected: ${user.id}`);
    }
  }

  /**
   * The handleConnection() method comes from the OnGatewayConnection lifecycle interface in NestJS.
   * It’s automatically called by NestJS when a client first connects to the gateway.
   */
  async handleConnection(socket: Socket) {
    const token = socket.handshake.auth?.token;
    const payload = this.authService.validateToken(token);

    if (!payload) {
      socket.disconnect(); // Invalid token.
      this.logger.error(`[Socket] Forced Disconnection: ${socket.id} - invalid token or sessionId`);
      return;
    }

    socket.data.boardId = payload.boardId;

    socket.setMaxListeners(30);
    socket.join(payload.boardId);
  }

  @SubscribeMessage('board:join')
  async handleJoinBoard(@ConnectedSocket() socket: Socket) {
    const token = socket.handshake.auth?.token;
    const payload = this.authService.validateToken(token);

    if (this.boardService.boardExists(payload.boardId)) {
      // Get or create user
      let user: User = this.boardService.getUser(payload.boardId, payload.sub);

      if (!user) {
        // New user is joining the board!
        user = {
          id: payload.sub,
          boardId: payload.boardId,
          role: payload.role,
        };

        const joinBoard = this.boardService.joinBoard(payload.boardId, user);
        const usersInBoard: User[] = [...joinBoard.getUsers().values()];

        this.logger.log(`[Board: ${joinBoard.getId()}] User Joined: ${user.id}`);
        this.server.to(joinBoard.getId()).emit('board:users:updated', {
          users: usersInBoard,
        });
      }
      socket.data.user = user;
      return { success: true };
    }
    return { success: false };
  }
}
