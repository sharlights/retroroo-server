import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { BoardService } from '../board/board.service';
import { Logger } from '@nestjs/common';
import { UserService } from '../board/users/user.service';
import { RetroUser } from '../board/users/retro-user.dto';
import { UserUpdatedPayload } from './model.dto';

@WebSocketGateway()
export class AuthGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(AuthGateway.name);

  constructor(
    private authService: AuthService,
    private boardService: BoardService,
    private userService: UserService,
  ) {}

  async handleDisconnect(socket: Socket) {
    const token = socket.handshake.auth?.token;
    const payload = this.authService.validateToken(token);

    if (payload) {
      const boardId = payload.boardId;
      const userId = payload.sub;

      if (boardId && userId) {
        await this.userService.userDisconnected(userId);
        const usersInBoard = await this.userService.getActiveUsers(payload.boardId);

        this.server.to(boardId).emit('board:users:updated', {
          users: usersInBoard,
        } as UserUpdatedPayload);

        this.logger.log(`[Board: ${payload.boardId}] User disconnected: ${userId}`);
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

    socket.data.boardId = jwtPayload.boardId;

    socket.setMaxListeners(30);
    socket.join(boardId);

    // Create or get user
    let user: RetroUser = await this.userService.getUser(jwtPayload.sub);

    if (!user) {
      user = await this.userService.createUser(boardId, jwtPayload.sub, jwtPayload.role);

      const usersInBoard = await this.userService.getUsers(boardId);
      this.server.to(boardId).emit('board:users:updated', {
        users: usersInBoard,
      } as UserUpdatedPayload);
    } else {
      await this.userService.userConnected(user.id);
    }

    socket.data.user = user;

    socket.emit('board:joined', { success: true });
  }
}
