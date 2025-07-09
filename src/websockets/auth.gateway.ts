import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { BoardService } from '../board/board.service';
import { Logger } from '@nestjs/common';
import { UserService } from '../board/users/user.service';
import { RetroUser } from '../board/users/retro-user.dto';
import { StageChangedEvent, StageMetadataUpdatedEvent, UserUpdatedPayload } from './model.dto';
import { StageService } from '../board/stage/stage.service';

@WebSocketGateway()
export class AuthGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(AuthGateway.name);

  constructor(
    private authService: AuthService,
    private boardService: BoardService,
    private userService: UserService,
    private stageService: StageService,
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
    const board = await this.boardService.getBoard(boardId);
    if (!board) {
      socket.disconnect();
      this.logger.error(`[Socket] Board does not exist: ${jwtPayload.boardId} `);
      return;
    }

    socket.data.boardId = jwtPayload.boardId;

    socket.setMaxListeners(30);
    socket.join(boardId);

    // User should already exist via the registration process.
    const user: RetroUser = await this.userService.getUser(jwtPayload.sub);

    await this.userService.userConnected(user.id);

    const usersInBoard = await this.userService.getActiveUsers(boardId);

    // Tell everyone a new user has joined!
    this.server.to(boardId).emit('board:users:updated', {
      users: usersInBoard,
    } as UserUpdatedPayload);

    // Tell the new user the current board stage.
    socket.emit('board:stage:updated', {
      stage: board.stage,
    } as StageChangedEvent);

    const finishedUsers = await this.stageService.getFinished(boardId, board.stage);
    this.server.to(board.id).emit('board:stage:metadata:updated', {
      stage: board.stage,
      finishedUsers: finishedUsers,
    } as StageMetadataUpdatedEvent);

    socket.data.user = user;
    socket.emit('board:joined', { success: true });
  }
}
