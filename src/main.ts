import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getCorsOrigin } from './config/cors.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Add global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  const corsOrigin = getCorsOrigin();
  const nodeEnv = configService.get<string>('NODE_ENV');
  const port = configService.get<number>('PORT') ?? 3000;
  
  console.log('=== CORS Configuration ===');
  console.log('CORS_ORIGIN:', corsOrigin);
  console.log('NODE_ENV:', nodeEnv);
  console.log('Port:', port);
  console.log('========================');
  
  app.enableCors({
    origin: corsOrigin,
    methods: 'GET,POST,PUT,PATCH,DELETE',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  console.log('CORS enabled for origins:', corsOrigin);
  await app.listen(port);
}
bootstrap();
