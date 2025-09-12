import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { AuthModule } from '../auth/auth.module';
import { ListService } from './lists/list.service';
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
import { RetroIntentEntity } from '../intent/retro-intent.entity';
import { RetroTemplateEntity } from './template/retro-template.entity';
import { RetroTemplateListEntity } from './template/retro-template-list.entity';
import { TemplateService } from './template/retro-template.service';
import { BoardViewMapper } from './board-view-mapper';
import { ListViewMapper } from './lists/list-view-mapper';
import { CardViewMapper } from './card/card-view-mapper';

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
      RetroIntentEntity,
      RetroTemplateEntity,
      RetroTemplateListEntity,
    ]),
  ],
  providers: [
    BoardService,
    ListService,
    InviteService,
    HeadspaceService,
    UserService,
    CardsService,
    StageService,
    TemplateService,
    ListViewMapper,
    CardViewMapper,
    BoardViewMapper,
  ],
  controllers: [RegisterController],
  exports: [
    BoardService,
    ListService,
    InviteService,
    HeadspaceService,
    UserService,
    CardsService,
    StageService,
    TemplateService,
    ListViewMapper,
    CardViewMapper,
  ],
})
export class BoardModule {}
