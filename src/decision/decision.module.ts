import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RetroDecisionEntity } from './retro-decision.entity';
import { DecisionService } from './decision.service';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([RetroDecisionEntity])],
  providers: [DecisionService],
  exports: [DecisionService],
})
export class DecisionModule {}
