import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { ProxyHlsPlaylistDocs } from '../docs/proxy-hls-playlist.docs';
import { ProxyHlsSegmentDocs } from '../docs/proxy-hls-segment.docs';
import { CameraIdParamDTO } from '../dtos/camera-id-param.dto';
import { StreamSegmentParamDTO } from '../dtos/stream-segment-param.dto';
import { HlsProxyService } from '../services/hls-proxy.service';

/**
 * Proxy HLS por câmera, **público** (a visualização do vídeo é pública — sem
 * `X-API-Key`; o conteúdo já é público e o controle de abuso/banda fica para a
 * borda nginx). Por isso o frontend aponta o player direto para estas rotas, sem
 * BFF intermediário. Versão v2 (#473) do proxy `streams`: resolve a câmera no
 * Postgres (módulo `cameras`), em vez do Firestore.
 *
 * - `GET /camera-streams/:cameraId/index.m3u8` — master playlist
 * - `GET /camera-streams/:cameraId/:segment` — segmentos (`*.m4s`, `*.mp4`,
 *   `init.mp4`) e playlists de variante (`*.m3u8`, ex.: `video1_stream.m3u8`)
 *   que o master referencia num stream multivariante (default do mediamtx em
 *   fMP4/LL-HLS)
 *
 * As respostas são **pipe direto** do mediamtx para o `Response` (via `@Res`),
 * sem materializar bytes em memória. A rota da playlist é declarada **antes** da
 * rota genérica de segmento para que `index.m3u8` tenha precedência no matching.
 */
@ApiTags('Camera Streams')
@Controller('camera-streams')
export class CameraStreamProxyController {
  constructor(private readonly proxy: HlsProxyService) {}

  @Get(':cameraId/index.m3u8')
  @ProxyHlsPlaylistDocs()
  playlist(
    @Param() params: CameraIdParamDTO,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    return this.proxy.proxyHls(
      params.cameraId,
      'index.m3u8',
      res,
      extractSearch(req),
    );
  }

  @Get(':cameraId/:segment')
  @ProxyHlsSegmentDocs()
  segment(
    @Param() params: StreamSegmentParamDTO,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    return this.proxy.proxyHls(
      params.cameraId,
      params.segment,
      res,
      extractSearch(req),
    );
  }
}

/**
 * Extrai a query string (com o `?` inicial) do pedido, ou `''` quando não há.
 * Repassada verbatim ao mediamtx para o *blocking reload* do LL-HLS
 * (`_HLS_msn`/`_HLS_part`) — sem ela o player faz polling e bate 404 na borda.
 */
function extractSearch(req: Request): string {
  /**
   * `req.originalUrl` é a URL como recebida (antes de rewrites de middleware) e
   * inclui a query string — preferível a `req.url`, que poderia vir reescrita.
   */
  const url = req.originalUrl ?? '';
  const idx = url.indexOf('?');
  return idx >= 0 ? url.slice(idx) : '';
}
