import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

/** Swagger de `GET /camera-streams/:cameraId/:segment` (segmentos e variantes HLS, públicos). */
export function ProxyHlsSegmentDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Proxy de um segmento (.m4s/.mp4) ou variante (.m3u8) HLS.',
      description:
        'Passthrough do segmento (init.mp4, *.m4s, *.mp4) ou da playlist de ' +
        'variante (*.m3u8) que o master referencia, servidos pelo mediamtx via ' +
        'tailnet. Segmentos imutáveis usam Cache-Control max-age=10; playlists ' +
        '(.m3u8) usam no-store.',
    }),
    ApiParam({
      name: 'cameraId',
      format: 'uuid',
      example: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    }),
    ApiParam({ name: 'segment', example: 'seg7.m4s' }),
    ApiQuery({
      name: '_HLS_msn',
      required: false,
      schema: { type: 'integer' },
      description:
        'Media sequence number do blocking reload (variantes LL-HLS).',
    }),
    ApiQuery({
      name: '_HLS_part',
      required: false,
      schema: { type: 'integer' },
      description: 'Índice da parte do blocking reload (variantes LL-HLS).',
    }),
    ApiResponse({ status: 200, description: 'Bytes do segmento HLS.' }),
    ApiResponse({ status: 404, description: 'Câmera/segmento inexistente.' }),
    ApiResponse({ status: 502, description: 'mediamtx inacessível.' }),
  );
}
