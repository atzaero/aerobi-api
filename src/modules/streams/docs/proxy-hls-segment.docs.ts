import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';

/** Swagger de `GET /streams/:cameraId/:segment` (segmentos HLS). */
export function ProxyHlsSegmentDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Proxy de um segmento HLS (.m4s/.mp4) da câmera.',
      description:
        'Passthrough do segmento (init.mp4, *.m4s, *.mp4) servido pelo ' +
        'mediamtx, via tailnet. Cache-Control max-age=10 (segmentos imutáveis).',
    }),
    ApiParam({ name: 'cameraId', example: 'aero-mvp-cam-1' }),
    ApiParam({ name: 'segment', example: 'seg7.m4s' }),
    ApiResponse({ status: 200, description: 'Bytes do segmento HLS.' }),
    ApiResponse({
      status: 401,
      description: 'Fora de bypass: `X-API-Key` em falta ou incorreto.',
    }),
    ApiResponse({ status: 404, description: 'Câmera/segmento inexistente.' }),
    ApiResponse({ status: 502, description: 'mediamtx inacessível.' }),
  );
}
