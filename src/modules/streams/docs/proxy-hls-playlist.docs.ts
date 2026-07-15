import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

/** Swagger de `GET /streams/:cameraId/index.m3u8` (playlist HLS, pública). */
export function ProxyHlsPlaylistDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Proxy da playlist HLS (.m3u8) da câmera.',
      description:
        'Resolve a câmera no Firestore (com cache) e faz passthrough da ' +
        'playlist servida pelo mediamtx no Raspi, via tailnet. Sem ' +
        'transcoding. Content-Type application/vnd.apple.mpegurl, no-store. ' +
        'Os query params do LL-HLS (`_HLS_msn`/`_HLS_part`) são repassados ' +
        'verbatim ao mediamtx para o blocking reload.',
    }),
    ApiParam({ name: 'cameraId', example: 'aero-mvp-cam-1' }),
    ApiQuery({
      name: '_HLS_msn',
      required: false,
      schema: { type: 'integer' },
      description: 'Media sequence number do blocking reload (LL-HLS).',
    }),
    ApiQuery({
      name: '_HLS_part',
      required: false,
      schema: { type: 'integer' },
      description: 'Índice da parte do blocking reload (LL-HLS).',
    }),
    ApiProduces('application/vnd.apple.mpegurl'),
    ApiResponse({ status: 200, description: 'Playlist HLS (m3u8).' }),
    ApiResponse({
      status: 404,
      description: 'Câmera inexistente, desativada ou path offline.',
    }),
    ApiResponse({
      status: 502,
      description: 'mediamtx inacessível (timeout/fora).',
    }),
  );
}
