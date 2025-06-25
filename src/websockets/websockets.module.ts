import { Module } from '@nestjs/common';
import { StageGateway } from './stage.gateway';
import { ListsGateway } from './lists.gateway';
import { HeadspaceGateway } from './headspace.gateway';
import { AuthGateway } from './auth.gateway';
import { InviteGateway } from './invite.gateway';
import { BoardModule } from '../board/board.module';
import { AuthModule } from 'src/auth/auth.module';
import { CardGateway } from './card.gateway';

@Module({
  imports: [BoardModule, AuthModule],
  providers: [StageGateway, ListsGateway, HeadspaceGateway, AuthGateway, InviteGateway, CardGateway],
})
export class WebsocketsModule {}
