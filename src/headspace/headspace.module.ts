import { Module } from '@nestjs/common';
import { StageModule } from '../stage/stage.module';
import { BoardModule } from '../board/board.module';
import { HeadspaceService } from './headspace.service';

@Module({
  imports: [StageModule, BoardModule],
  providers: [HeadspaceService],
  exports: [HeadspaceService],
})
export class HeadspaceModule {}
