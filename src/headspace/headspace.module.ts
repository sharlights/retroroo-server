import { Module } from '@nestjs/common';
import { StageModule } from '../stage/stage.module';
import { BoardModule } from '../board/board.module';
import { HeadspaceService } from './headspace.service';
import { HeadspaceGateway } from './headspace.gateway';

@Module({
  imports: [StageModule, BoardModule],
  providers: [HeadspaceService, HeadspaceGateway],

})
export class HeadspaceModule {}
