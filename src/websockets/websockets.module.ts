import { Module } from '@nestjs/common';
import { StageGateway } from './stage.gateway';
import { ListsGateway } from './lists.gateway';
import { HeadspaceGateway } from './headspace.gateway';
import { AuthGateway } from './auth.gateway';
import { InviteGateway } from './invite.gateway';
import { BoardModule } from '../board/board.module';
import { AuthModule } from 'src/auth/auth.module';
import { CardGateway } from './card.gateway';
import { ActionModule } from '../actions/action.module';
import { ActionGateway } from './action.gateway';

@Module({
  imports: [BoardModule, AuthModule, ActionModule],
  providers: [StageGateway, ListsGateway, HeadspaceGateway, AuthGateway, InviteGateway, CardGateway, ActionGateway],
})
export class WebsocketsModule {}
