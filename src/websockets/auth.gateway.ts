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

  async handleConnection(socket: Socket) {
    const token = socket.handshake.auth?.token;
    const jwtPayload = this.authService.validateToken(token);

    if (!jwtPayload) {
      socket.disconnect();
      this.logger.error(`[Socket] Forced Disconnection: ${socket.id} - invalid token`);
      return;
    }

    const boardId = jwtPayload.boardId;
    const board = this.boardService.getBoard(boardId);
    if (!board) {
      socket.disconnect();
      this.logger.error(`[Socket] Board does not exist: ${jwtPayload.boardId} `);
      return;
    }

    socket.setMaxListeners(30);
    socket.join(boardId);

    // Create or get user
    let user: RetroUser = this.userService.getUser(boardId, jwtPayload.sub);

    if (!user) {
      user = this.userService.createUser(boardId, jwtPayload.sub, jwtPayload.role);
      const board = this.userService.joinBoard(boardId, user);

      const usersInBoard = [...board.getUsers().values()];
      this.server.to(boardId).emit('board:users:updated', {
        users: usersInBoard,
      });
    }

    socket.data.user = user;
    socket.data.boardId = user.boardId;
    console.log('socket board id: ', user.boardId);

    socket.emit('board:joined', { success: true });
  }
}
