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
        '**Todas as rotas `/rab/*`** exigem header **`X-API-Key`** igual a **`RAB_SYNC_API_KEY`**, ' +
        'exceto em **`NODE_ENV=development`** sem `RAB_SYNC_REQUIRE_AUTH` (bypass para DX local). ' +
        'Com `RAB_SYNC_REQUIRE_AUTH=true`, o bypass é desativado também em development. ' +
        'Ver JSDoc: `RabApiKeyGuard`. ' +
        '**Rotas `/plugfield/*`** são proxy para a API Plugfield; exigem **`X-API-Key`** = **`PLUGFIELD_SYNC_API_KEY`** ' +
        '(mesmo padrão de bypass em development com `PLUGFIELD_SYNC_REQUIRE_AUTH`). ' +
        'Ver JSDoc: `PlugfieldApiKeyGuard`.',
    )
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' })
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('PORT', 3333);
  await app.listen(port);
}

void bootstrap();
