import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Add global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  const corsOrigin = process.env.CORS_ORIGIN || ['http://localhost:5173', 'http://localhost:5000'];
  console.log('CORS_ORIGIN:', corsOrigin);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  app.enableCors({
    origin: corsOrigin,
    methods: 'GET,POST,PUT,PATCH,DELETE',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
