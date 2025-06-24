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
import { RetroUser } from '../board/board.model';
import { Logger } from '@nestjs/common';
import { UserService } from '../board/users/user.service';

@WebSocketGateway()
export class AuthGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(AuthGateway.name);

  constructor(
    private authService: AuthService,
    private boardService: BoardService,
    private userService: UserService,
  ) {}

  handleDisconnect(socket: Socket) {
    const token = socket.handshake.auth?.token;
    const payload = this.authService.validateToken(token);

    if (payload) {
      const board = this.boardService.getBoard(payload.boardId);

      if (board) {
        const user = this.userService.getUser(board.getId(), payload.sub);

        if (user) {
          this.userService.leaveBoard(payload.boardId, user);
          const usersInBoard = this.userService.getUsers(payload.boardId);

          this.server.to(board.getId()).emit('board:users:updated', {
            users: usersInBoard,
          });

          this.logger.log(`[Board: ${payload.boardId}] User disconnected: ${user.id}`);
        }
      }
    }
  }

  /**
   * The handleConnection() method comes from the OnGatewayConnection lifecycle interface in NestJS.
   * It’s automatically called by NestJS when a client first connects to the gateway.
   */
  async handleConnection(socket: Socket) {
    const token = socket.handshake.auth?.token;
    const jwtPayload = this.authService.validateToken(token);

    if (!jwtPayload) {
      socket.disconnect(); // Invalid token.
      this.logger.error(`[Socket] Forced Disconnection: ${socket.id} - invalid token or sessionId`);
      return;
    }

    this.logger.log(`[Board: ${jwtPayload.boardId}] New Connection`);
    socket.setMaxListeners(30);
    socket.join(jwtPayload.boardId);
  }

  /**
   * Creates a new user and joins the board.
   * @param socket The socket connection.
   */
  @SubscribeMessage('board:join')
  async handleJoinBoard(@ConnectedSocket() socket: Socket) {
    const token = socket.handshake.auth?.token;
    const jwtPayload = this.authService.validateToken(token);

    this.logger.log(`[Board: ${jwtPayload.boardId}] User Attempting to Join Board`);
    if (this.boardService.boardExists(jwtPayload.boardId)) {
      // Get or create user
      let user: RetroUser = this.userService.getUser(jwtPayload.boardId, jwtPayload.sub);

      if (!user) {
        // New user is joining the board!
        user = this.userService.createUser(jwtPayload.sub, jwtPayload.boardId, jwtPayload.role);

        const joinBoard = this.userService.joinBoard(jwtPayload.boardId, user);
        const usersInBoard: RetroUser[] = [...joinBoard.getUsers().values()];

        this.server.to(joinBoard.getId()).emit('board:users:updated', {
          users: usersInBoard,
        });
      }

      socket.data.user = user;
      socket.data.boardId = user.boardId;

      return { success: true };
    }
    return { success: false };
  }
}
