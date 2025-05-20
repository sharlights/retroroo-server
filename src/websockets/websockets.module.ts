import { Module } from '@nestjs/common';
import { StageGateway } from './stage.gateway';
import { ListsGateway } from './lists.gateway';
import { HeadspaceGateway } from './headspace.gateway';
import { AuthGateway } from './auth.gateway';
import { InviteGateway } from './invite.gateway';
import { BoardModule } from '../board/board.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [BoardModule, AuthModule],
  providers: [StageGateway, ListsGateway, HeadspaceGateway, AuthGateway, InviteGateway],
})
export class WebsocketsModule {}
