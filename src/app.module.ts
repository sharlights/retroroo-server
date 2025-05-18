import { Module } from '@nestjs/common';
import { ListsModule } from './lists/lists.module';
import { BoardModule } from './board/board.module';
import { AuthModule } from './auth/auth.module';
import { InviteModule } from './invite/invite.module';
import { ConfigModule } from '@nestjs/config';
import { PresenceModule } from './presence/presence.module';
import { RegisterModule } from './register/register.module';
import { StageModule } from './stage/stage.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { HeadspaceService } from './headspace/headspace.service';
import { HeadspaceModule } from './headspace/headspace.module';

@Module({
  imports: [
    ListsModule,
    BoardModule,
    AuthModule,
    InviteModule,
    EventEmitterModule,
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'dev'}`,
      isGlobal: true,
    }),
    PresenceModule,
    RegisterModule,
    StageModule,
    HeadspaceModule,
  ],
  providers: [HeadspaceService],
})
export class AppModule {}
