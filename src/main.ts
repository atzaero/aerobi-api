import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from '@/app.module';
import { applyCors } from '@/bootstrap/cors/apply-cors';
import { isDevelopmentEnvironment } from '@/bootstrap/environment/is-development-environment';
import { applyGlobalExceptionFilter } from '@/bootstrap/http-pipeline/apply-global-exception-filter';
import { applyGlobalValidationPipe } from '@/bootstrap/http-pipeline/apply-global-validation-pipe';
import { listenWithRetries } from '@/bootstrap/listen-retries';
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
  /**
   * Em dev o watcher pode subir o novo bind antes de o ciclo anterior liberar
   * a porta; `listenWithRetries` retenta só em EADDRINUSE. Em prod queremos
   * falha rápida (porta ocupada = algo errado no ambiente).
   */
  if (isDevelopment) {
    await listenWithRetries(app, port);
  } else {
    await app.listen(port);
  }
  const at = new Date().toISOString();
  console.log(
    `🚀 Aerobi API iniciada na porta ${port} [${process.env.NODE_ENV}] em ${at}`,
  );

  /**
   * HMR (dev): aceita o módulo recompilado e fecha a app anterior no dispose,
   * liberando a porta no MESMO processo — elimina por construção a corrida de
   * EADDRINUSE do restart-por-processo do watcher. Ver webpack-hmr.config.js.
   */
  if (isDevelopment && module.hot) {
    module.hot.accept();
    module.hot.dispose(() => {
      void app.close();
    });
  }
}

void bootstrap();
