import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BoardModule } from '../board/board.module';
import { RegisterController } from './register.controller';

@Module({
  imports: [AuthModule, BoardModule],
  controllers: [RegisterController],
})
export class RegisterModule {}
