import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { CamerasModule } from '@/modules/cameras/cameras.module';

import { CameraStreamProxyController } from './controllers/camera-stream-proxy.controller';
import { ListAerodromeCameraStreamsController } from './controllers/list-aerodrome-camera-streams.controller';
import { HlsProxyService } from './services/hls-proxy.service';
import { ListAerodromeCameraStreamsService } from './services/list-aerodrome-camera-streams.service';
import { parsePositiveInt } from './utils/parse-positive-int';

/**
 * Proxy HLS **v2** (#473, epic #353) — listagem pública de câmeras por aeródromo
 * e proxy HLS do mediamtx no Raspi (via tailnet). Substitui o `streams` legado
 * (Firestore) lendo os metadados do **Postgres**, via {@link CamerasModule}
 * (`CameraQueryService`). Estratégia strangler-fig: roda **em paralelo** ao
 * legado (rotas com prefixo distinto `/camera-streams` e
 * `/aerodromes/:icao/camera-streams`), sem tocar nele; a remoção do legado é a
 * #474.
 *
 * Rotas **públicas** (sem `X-API-Key`/JWT): a visualização do vídeo é pública e
 * o controle de abuso/banda fica na borda nginx (decisões #317). Importa
 * `CamerasModule` (que exporta o `CameraQueryService`) e configura o `HttpModule`
 * com timeout (`CAMERA_STREAMS_PROXY_TIMEOUT_MS`, default 10s) para o mediamtx.
 */
@Module({
  imports: [
    CamerasModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        timeout: parsePositiveInt(
          config.get<string | number>('CAMERA_STREAMS_PROXY_TIMEOUT_MS'),
          10_000,
        ),
        maxRedirects: 0,
      }),
    }),
  ],
  controllers: [
    ListAerodromeCameraStreamsController,
    CameraStreamProxyController,
  ],
  providers: [HlsProxyService, ListAerodromeCameraStreamsService],
})
export class CameraStreamsModule {}
