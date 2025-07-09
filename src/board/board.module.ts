import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { AuthModule } from '../auth/auth.module';
import { ListsService } from './lists/lists.service';
import { RegisterController } from './register/register.controller';
import { InviteService } from './invite/invite.service';
import { HeadspaceService } from './headspace/headspace.service';
import { UserService } from './users/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RetroUserEntity } from './users/retro-user.entity';
import { CardsService } from './card/cards.service';
import { RetroBoardEntity } from './retro-board.entity';
import { RetroCardEntity } from './card/retro-card.entity';
import { RetroListEntity } from './lists/retro-list.entity';
import { RetroVoteEntity } from './card/retro-card-vote.entity';
import { StageService } from './stage/stage.service';
import { RetroStageFinishedEntity } from './stage/retro-stage-finished.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      RetroUserEntity,
      RetroBoardEntity,
      RetroCardEntity,
      RetroListEntity,
      RetroVoteEntity,
      RetroStageFinishedEntity,
    ]),
  ],
  providers: [BoardService, ListsService, InviteService, HeadspaceService, UserService, CardsService, StageService],
  controllers: [RegisterController],
  exports: [BoardService, ListsService, InviteService, HeadspaceService, UserService, CardsService, StageService],
})
export class BoardModule {}
