import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Global validation
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Global API prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;

  await app.listen(port);

  console.log(`\n===== NestJS Backend Running =====`);
  console.log(`Port: ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`MongoDB: ${process.env.MONGODB_URI?.substring(0, 50)}...`);
  console.log(`====================================\n`);
}

bootstrap();
