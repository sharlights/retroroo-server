import { Module } from '@nestjs/common';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { BoardGateway } from './board.gateway';
import { AuthModule } from '../auth/auth.module';
import { ListsModule } from '../lists/lists.module';

@Module({
  controllers: [BoardController],
  imports: [AuthModule, ListsModule],
  providers: [BoardService, BoardGateway],
})
export class BoardModule {}
