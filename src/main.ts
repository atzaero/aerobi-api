import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from '@/app.module';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const isDev =
    configService.get<string>('NODE_ENV', 'development') === 'development';
  const corsOrigins = configService
    .get<string>('CORS_ORIGINS', 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());

  app.enableCors({
    origin: isDev ? true : corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key',
    ],
    credentials: true,
  });

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Aerobi API')
    .setDescription(
      'API Nest para sincronização do RAB (ANAC). ' +
        'POST /rab/sync: em **`NODE_ENV=development`** o guard aceita pedidos **sem** auth (bypass). ' +
        'Noutros ambientes (ou com `RAB_SYNC_REQUIRE_AUTH=true`): **Firebase ID token** em `Authorization: Bearer` (`getIdToken()` no cliente) **ou** `X-API-Key` quando `RAB_SYNC_API_KEY` estiver definida. ' +
        'Ver JSDoc: `FirebaseOrApiKeyGuard`, `FirebaseAdminService`.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' })
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('PORT', 3333);
  await app.listen(port);
}

void bootstrap();
