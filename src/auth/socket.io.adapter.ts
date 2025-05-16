import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { INestApplicationContext } from '@nestjs/common';

export class RetroRooSocketIoAdapter extends IoAdapter {

  constructor(
    private app: INestApplicationContext,
    private configService: ConfigService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const origin = this.configService.get<string>('CORS_ORIGIN');

    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: origin,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });
    return server;
  }
}