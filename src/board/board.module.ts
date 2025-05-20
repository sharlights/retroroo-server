import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { AuthModule } from '../auth/auth.module';
import { PresenceService } from './presence/presence.service';
import { ListsService } from './lists/lists.service';
import { RegisterController } from './register/register.controller';
import { InviteService } from './invite/invite.service';

@Module({
  imports: [AuthModule],
  providers: [BoardService, PresenceService, ListsService, InviteService],
  controllers: [RegisterController],
  exports: [BoardService, PresenceService, ListsService, InviteService],
})
export class BoardModule {}
