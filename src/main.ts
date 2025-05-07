import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigModule } from '@nestjs/config';

ConfigModule.forRoot({
  envFilePath: `.env.${process.env.NODE_ENV || 'dev'}`,
  isGlobal: true,
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
