import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Add global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  const corsOrigin = configService.get<string>('CORS_ORIGIN') || ['http://localhost:5173', 'http://localhost:5000'];
  const nodeEnv = configService.get<string>('NODE_ENV');
  const port = configService.get<number>('PORT') ?? 3000;
  
  console.log('CORS_ORIGIN:', corsOrigin);
  console.log('NODE_ENV:', nodeEnv);
  
  app.enableCors({
    origin: corsOrigin,
    methods: 'GET,POST,PUT,PATCH,DELETE',
    credentials: true,
  });
  await app.listen(port);
}
bootstrap();
