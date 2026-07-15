import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { DocumentResponseDTO } from '../dtos/document-response.dto';
import {
  UPLOAD_AERODROME_FILE_MODES,
  UPLOAD_AERODROME_FILE_TYPES,
} from '../dtos/upload-aerodrome-file.dto';

export function UploadAerodromeFileDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Envia KML/imagem do aeródromo (upload dedicado)',
      description:
        'Requer `aerodrome:update` (create/update compartilham roles). ' +
        '`multipart/form-data` com `file` (≤10 MB), `aerodromeId`, ' +
        '`type∈{kml,image}`, `mode∈{create,update}`. Valida mimetype/extensão; ' +
        'mantém 1 ativo por tipo (soft-delete do anterior); para KML dispara a ' +
        'geração de GeoJSON best-effort.',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: ['file', 'aerodromeId', 'type', 'mode'],
        properties: {
          file: { type: 'string', format: 'binary' },
          aerodromeId: { type: 'string', format: 'uuid' },
          type: { type: 'string', enum: [...UPLOAD_AERODROME_FILE_TYPES] },
          mode: { type: 'string', enum: [...UPLOAD_AERODROME_FILE_MODES] },
        },
      },
    }),
    ApiCreatedResponse({ type: DocumentResponseDTO }),
    ApiBadRequestResponse({
      description:
        'Arquivo ausente/vazio, acima de 10 MB, ou mimetype/extensão inválido ' +
        '(image: jpeg/png/webp; kml: .kml/.kmz).',
    }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({
      description:
        'Sem permissão `aerodrome:update` ou aeródromo fora do escopo.',
    }),
    ApiNotFoundResponse({
      description: 'Aeródromo inexistente ou fora do escopo.',
    }),
  );
}
