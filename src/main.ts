import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RetroRooSocketIoAdapter } from './auth/socket.io.adapter';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const origin = configService.get<string>('CORS_ORIGIN');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS management for socket & http requests.
  app.enableCors({
    origin: origin, // Allow requests from this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true, // Allow credentials (e.g., cookies, authorization headers
  });
  app.useWebSocketAdapter(new RetroRooSocketIoAdapter(app, configService));
  await app.listen(49185, '0.0.0.0');
}

bootstrap();
