import { Module } from '@nestjs/common';
import { StageService } from './stage.service';
import { BoardModule } from '../board/board.module';

@Module({
  imports: [BoardModule],
  providers: [StageService],
  exports: [StageService],
})
export class StageModule {}
