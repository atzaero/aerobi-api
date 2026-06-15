import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';

/** Swagger de `GET /streams/:cameraId/index.m3u8` (playlist HLS). */
export function ProxyHlsPlaylistDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Proxy da playlist HLS (.m3u8) da câmera.',
      description:
        'Resolve a câmera no Firestore (com cache) e faz passthrough da ' +
        'playlist servida pelo mediamtx no Raspi, via tailnet. Sem ' +
        'transcoding. Content-Type application/vnd.apple.mpegurl, no-store.',
    }),
    ApiParam({ name: 'cameraId', example: 'aero-mvp-cam-1' }),
    ApiProduces('application/vnd.apple.mpegurl'),
    ApiResponse({ status: 200, description: 'Playlist HLS (m3u8).' }),
    ApiResponse({
      status: 401,
      description: 'Fora de bypass: `X-API-Key` em falta ou incorreto.',
    }),
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
