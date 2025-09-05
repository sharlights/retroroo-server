import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActionsService } from './actions.service';
import { RetroActionEntity } from './retro-action.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([RetroActionEntity])],
  providers: [ActionsService],
  exports: [ActionsService],
})
export class ActionModule {}
