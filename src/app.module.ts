import { Module } from '@nestjs/common';
import { ListsModule } from './lists/lists.module';
import { BoardModule } from './board/board.module';
import { AuthModule } from './auth/auth.module';
import { InviteModule } from './invite/invite.module';
import { ConfigModule } from '@nestjs/config';
import { PresenceModule } from './presence/presence.module';
import { RegisterModule } from './register/register.module';

@Module({
  imports: [
    ListsModule,
    BoardModule,
    AuthModule,
    InviteModule,
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'dev'}`,
      isGlobal: true,
    }),
    PresenceModule,
    RegisterModule,
  ],
})
export class AppModule {}
