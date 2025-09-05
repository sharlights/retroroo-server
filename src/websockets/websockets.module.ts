import { Module } from '@nestjs/common';
import { StageGateway } from './stage.gateway';
import { HeadspaceGateway } from './headspace.gateway';
import { AuthGateway } from './auth.gateway';
import { BoardModule } from '../board/board.module';
import { AuthModule } from 'src/auth/auth.module';
import { ActionModule } from '../actions/action.module';
import { DecisionModule } from '../decision/decision.module';
import { BoardGateway } from './board.gateway';

@Module({
  imports: [BoardModule, AuthModule, ActionModule, DecisionModule],
  providers: [StageGateway, HeadspaceGateway, AuthGateway, BoardGateway],
})
export class WebsocketsModule {}
