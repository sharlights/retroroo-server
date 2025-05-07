import { Module } from '@nestjs/common';
import { ListsModule } from './lists/lists.module';
import { BoardModule } from './board/board.module';
import { AuthModule } from './auth/auth.module';
import { InviteModule } from './invite/invite.module';

@Module({
  imports: [ListsModule, BoardModule, AuthModule, InviteModule],
})
export class AppModule {}
