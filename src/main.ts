import * as cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const frontendBaseUrl = configService.get<string>(
    'FRONTEND_BASE_URL',
    'http://localhost:3001',
  );

  // 1. Set the global prefix to the API version
  app.setGlobalPrefix('api/v1');

  // 2. Enable CORS
  app.enableCors({
    origin: frontendBaseUrl,
    credentials: true,
  });

  // 3. Apply middlewares
  app.use(cookieParser());

  // 4. Apply global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Movie Reservation System')
    .setDescription('A system that allows users to reserve movie tickets')
    .setVersion('1.0.1')
    .addBearerAuth()
    .build();
  const options: SwaggerDocumentOptions = {
    operationIdFactory: (_controllerKey: string, methodKey: string) =>
      methodKey,
  };
  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, options);

  SwaggerModule.setup('api/v1/documentation', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
