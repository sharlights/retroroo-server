import { Module } from '@nestjs/common';
import { BoardModule } from './board/board.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WebsocketsModule } from './websockets/websockets.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { loadDatabaseConfig } from './core/db/database.config';

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
    TypeOrmModule.forRoot(loadDatabaseConfig(process.env.NODE_ENV)),
  ],
})
export class AppModule {}
