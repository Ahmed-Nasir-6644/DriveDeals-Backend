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
  
  console.log('=== Application Bootstrap ===');
  console.log('NODE_ENV:', nodeEnv);
  console.log('Port:', port);
  console.log('==========================');
  
  // Enable CORS with detailed configuration
  app.enableCors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
    maxAge: 3600,
  });
  console.log('CORS enabled for origins:', corsOrigin);
  
  await app.listen(port);
  console.log(`Application is running on port ${port}`);
}
bootstrap();
