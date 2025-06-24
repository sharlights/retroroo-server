import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { AuthModule } from '../auth/auth.module';
import { ListsService } from './lists/lists.service';
import { RegisterController } from './register/register.controller';
import { InviteService } from './invite/invite.service';
import { HeadspaceService } from './headspace/headspace.service';
import { UserService } from './users/user.service';

@Module({
  imports: [AuthModule],
  providers: [BoardService, ListsService, InviteService, HeadspaceService, UserService],
  controllers: [RegisterController],
  exports: [BoardService, ListsService, InviteService, HeadspaceService, UserService],
})
export class BoardModule {}
