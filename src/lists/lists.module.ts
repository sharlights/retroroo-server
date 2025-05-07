import { Module } from '@nestjs/common';
import { ListsService } from './lists.service';
import { ListsGateway } from './lists.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [ListsService, ListsGateway],
  exports: [ListsService],
})
export class ListsModule {}
