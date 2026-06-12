import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from '@/app.module';
import { applyCors } from '@/bootstrap/cors/apply-cors';
import { isDevelopmentEnvironment } from '@/bootstrap/environment/is-development-environment';
import { applyGlobalExceptionFilter } from '@/bootstrap/http-pipeline/apply-global-exception-filter';
import { applyGlobalValidationPipe } from '@/bootstrap/http-pipeline/apply-global-validation-pipe';
import { resolveHttpPort } from '@/bootstrap/port/resolve-http-port';
import { applyShutdownHooks } from '@/bootstrap/shutdown/apply-shutdown-hooks';
import { setupSwagger } from '@/bootstrap/swagger/setup-swagger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  const isDevelopment = isDevelopmentEnvironment(configService);
  applyCors(app, configService, isDevelopment);
  applyGlobalExceptionFilter(app);
  applyGlobalValidationPipe(app);
  setupSwagger(app);
  applyShutdownHooks(app);

  const port = resolveHttpPort(configService);
  await app.listen(port);
  console.log(
    `🚀 Aerobi API iniciada na porta ${port} [${process.env.NODE_ENV}]`,
  );
}

void bootstrap();
