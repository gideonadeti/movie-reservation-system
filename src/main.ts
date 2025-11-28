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

  // CORS configuration - only allow the frontend origin
  const frontendOrigin = configService.get<string>(
    'CORS_ORIGIN',
    'http://localhost:3001',
  );

  app.enableCors({
    origin: frontendOrigin,
    credentials: true,
  });

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

  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('Movie Reservation System')
    .setDescription('A system that allows users to reserve movie tickets')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Auth')
    .addTag('Movies')
    .addTag('Showtimes')
    .addTag('Reservations')
    .addTag('Auditoriums')
    .addTag('Seats')
    .build();
  const options: SwaggerDocumentOptions = {
    operationIdFactory: (_controllerKey: string, methodKey: string) =>
      methodKey,
  };
  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, options);

  SwaggerModule.setup('api/documentation', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
