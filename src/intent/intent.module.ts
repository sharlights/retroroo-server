import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntentService } from './intent.service';
import { RetroIntentEntity } from './retro-intent.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([RetroIntentEntity])],
  providers: [IntentService],
  exports: [IntentService],
})
export class IntentModule {}
