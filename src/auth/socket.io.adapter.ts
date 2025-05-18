import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { INestApplicationContext, Logger } from '@nestjs/common';

export class RetroRooSocketIoAdapter extends IoAdapter {
  private readonly logger = new Logger(RetroRooSocketIoAdapter.name);

  constructor(
    private app: INestApplicationContext,
    private configService: ConfigService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const origin = this.configService.get<string>('CORS_ORIGIN');
    this.logger.log(`CORS ORIGIN: ${origin}`, 'RetroRooSocketIoAdapter');

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
