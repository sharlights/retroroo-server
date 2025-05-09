import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';

@WebSocketGateway()
export class BoardGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('board:connect')
  handleBoardConnect(@ConnectedSocket() socket: Socket) {
    const user = socket.data.user;
    if (!user) throw new WsException('Unauthorized');
    return { boardId: user.boardId, userId: user.sub, role: user.role };
  }
}
