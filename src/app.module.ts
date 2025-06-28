import { Module } from '@nestjs/common';
import { BoardModule } from './board/board.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WebsocketsModule } from './websockets/websockets.module';
import { TypeOrmModule } from '@nestjs/typeorm';

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

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: Number(config.get('DB_PORT')),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: config.get('DB_SYNC') === 'true',
      }),
    }),
  ],
})
export class AppModule {}
