import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { ProxyHlsPlaylistDocs } from '../docs/proxy-hls-playlist.docs';
import { ProxyHlsSegmentDocs } from '../docs/proxy-hls-segment.docs';
import { CameraIdParamDTO } from '../dtos/camera-id-param.dto';
import { StreamSegmentParamDTO } from '../dtos/stream-segment-param.dto';
import { HlsProxyService } from '../services/hls-proxy.service';

/**
 * Proxy HLS por câmera, protegido por `AerobiApiKeyGuard`:
 *
 * - `GET /streams/:cameraId/index.m3u8` — playlist
 * - `GET /streams/:cameraId/:segment` — segmentos (`*.m4s`, `*.mp4`, `init.mp4`)
 *
 * As respostas são **pipe direto** do mediamtx para o `Response` (via `@Res`),
 * sem materializar bytes em memória. A rota da playlist é declarada **antes** da
 * rota genérica de segmento para ter precedência no matching.
 */
@ApiTags('Streams')
@Controller('streams')
@UseGuards(AerobiApiKeyGuard)
export class StreamsProxyController {
  constructor(private readonly proxy: HlsProxyService) {}

  @Get(':cameraId/index.m3u8')
  @ProxyHlsPlaylistDocs()
  playlist(
    @Param() params: CameraIdParamDTO,
    @Res() res: Response,
  ): Promise<void> {
    return this.proxy.proxyHls(params.cameraId, 'index.m3u8', res);
  }

  @Get(':cameraId/:segment')
  @ProxyHlsSegmentDocs()
  segment(
    @Param() params: StreamSegmentParamDTO,
    @Res() res: Response,
  ): Promise<void> {
    return this.proxy.proxyHls(params.cameraId, params.segment, res);
  }
}
