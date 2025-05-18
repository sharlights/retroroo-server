import { Module } from '@nestjs/common';
import { StageService } from './stage.service';
import { BoardModule } from '../board/board.module';
import { StageGateway } from './stage.gateway';

@Module({
  imports: [BoardModule],
  providers: [StageService, StageGateway],
  exports: [StageService],
})
export class StageModule {}
