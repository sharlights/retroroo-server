import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RetroActionEntity } from './retroActionEntity';
import { ActionsService } from './actions.service';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([RetroActionEntity])],
  providers: [ActionsService],
  exports: [ActionsService],
})
export class ActionModule {}
