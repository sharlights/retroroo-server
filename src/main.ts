import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RetroRooSocketIoAdapter } from './auth/socket.io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:4200', // Allow requests from this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true, // Allow credentials (e.g., cookies, authorization headers
  });
  app.useWebSocketAdapter(new RetroRooSocketIoAdapter(app));
  await app.listen(49185);
}
bootstrap();
