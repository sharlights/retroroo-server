import { Module } from '@nestjs/common';
import { InviteService } from './invite.service';
import { InviteGateway } from './invite.gateway';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { InviteController } from './invite.controller';

@Module({
  controllers: [InviteController],
  imports: [AuthModule, ConfigModule],
  providers: [InviteService, InviteGateway],
})
export class InviteModule {}
