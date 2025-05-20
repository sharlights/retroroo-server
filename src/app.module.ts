import { Module } from '@nestjs/common';
import { BoardModule } from './board/board.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { StageModule } from './stage/stage.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { HeadspaceModule } from './headspace/headspace.module';
import { WebsocketsModule } from './websockets/websockets.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    WebsocketsModule,
    BoardModule,
    AuthModule,
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'dev'}`,
      isGlobal: true,
    }),
    StageModule,
    HeadspaceModule,
  ],
})
export class AppModule {}
