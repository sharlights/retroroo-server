import { Module } from '@nestjs/common';
import { StageGateway } from './stage.gateway';
import { PresenceGateway } from './presence.gateway';
import { ListsGateway } from './lists.gateway';
import { HeadspaceGateway } from './headspace.gateway';
import { AuthGateway } from './auth.gateway';
import { InviteGateway } from './invite.gateway';
import { BoardModule } from '../board/board.module';
import { AuthModule } from 'src/auth/auth.module';
import { HeadspaceModule } from '../headspace/headspace.module';
import { StageModule } from '../stage/stage.module';

@Module({
  imports: [BoardModule, AuthModule, HeadspaceModule, StageModule],
  providers: [StageGateway, PresenceGateway, ListsGateway, HeadspaceGateway, AuthGateway, InviteGateway],
})
export class WebsocketsModule {}
