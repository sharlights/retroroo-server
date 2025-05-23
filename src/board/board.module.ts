import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { AuthModule } from '../auth/auth.module';
import { ListsService } from './lists/lists.service';
import { RegisterController } from './register/register.controller';
import { InviteService } from './invite/invite.service';
import { HeadspaceService } from './headspace/headspace.service';

@Module({
  imports: [AuthModule],
  providers: [BoardService, ListsService, InviteService, HeadspaceService],
  controllers: [RegisterController],
  exports: [BoardService, ListsService, InviteService, HeadspaceService],
})
export class BoardModule {}
