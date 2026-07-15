import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { FirestoreModule } from '@/common/firestore/firestore.module';
import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { ListAerodromeCamerasController } from './controllers/list-aerodrome-cameras.controller';
import { StreamsProxyController } from './controllers/streams-proxy.controller';
import { CameraRepository } from './repositories/camera.repository';
import { CameraResolverService } from './services/camera-resolver.service';
import { HlsProxyService } from './services/hls-proxy.service';
import { ListAerodromeCamerasService } from './services/list-aerodrome-cameras.service';
import { parsePositiveInt } from './utils/parse-positive-int';

/**
 * Módulo de streams (épica #317) — listagem de câmeras por aeródromo e **proxy
 * HLS** do mediamtx no Raspi (via tailnet), ambos sob `AerobiApiKeyGuard`.
 *
 * Desenho **Firestore-first**: não há tabela no Postgres nem CRUD de câmeras
 * aqui — o cadastro vive no Firestore (collection `cameras`), gerido pelo
 * frontend (atzaero/aerobi#1008). O backend só **lê** (via {@link
 * CameraRepository}) e faz **passthrough** de bytes (sem transcoding).
 *
 * Importa o `FirestoreModule` explicitamente (apesar de ser `@Global`) para não
 * depender da ordem de import de outro módulo — o `FirestoreService` de
 * {@link CameraRepository} fica garantido por este módulo.
 *
 * `HttpModule` é configurado com timeout (`STREAMS_PROXY_TIMEOUT_MS`, default
 * 10s) para a chamada ao mediamtx.
 */
@Module({
  imports: [
    FirestoreModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        timeout: parsePositiveInt(
          config.get<string | number>('STREAMS_PROXY_TIMEOUT_MS'),
          10_000,
        ),
        maxRedirects: 0,
      }),
    }),
  ],
  controllers: [ListAerodromeCamerasController, StreamsProxyController],
  providers: [
    AerobiApiKeyGuard,
    CameraRepository,
    CameraResolverService,
    HlsProxyService,
    ListAerodromeCamerasService,
  ],
})
export class StreamsModule {}
