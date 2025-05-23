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
import { Board, User } from '../board/board.model';
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

      this.server.to(board.getId()).emit('board:users:updated', {
        users: this.getUserFromBoard(board),
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

    socket.setMaxListeners(30);
    socket.join(payload.boardId);
  }

  @SubscribeMessage('board:join')
  async handleJoinBoard(@ConnectedSocket() socket: Socket) {
    const token = socket.handshake.auth?.token;
    const payload = this.authService.validateToken(token);

    const board = this.boardService.getBoard(payload.boardId);
    if (board) {
      // Get or create user
      let user = this.boardService.getUser(payload.boardId, payload.sub);

      if (!user) {
        // New user is joining the board!
        user = new User(payload.sub, payload.boardId, payload.role);
        this.boardService.joinBoard(payload.boardId, user);

        this.logger.log(`[Board: ${payload.boardId}] User Joined: ${user.id}`);
        this.server.to(board.getId()).emit('board:users:updated', {
          users: this.getUserFromBoard(board),
        });
      }
      socket.data.user = user;
    }
  }

  private getUserFromBoard(board: Board) {
    const usersMap = board.getUsers();
    return Object.fromEntries(
      Array.from(usersMap).map(([id, user]) => [
        id,
        {
          id: user.id,
          boardId: user.boardId,
          role: user.role,
        },
      ]),
    );
  }
}
