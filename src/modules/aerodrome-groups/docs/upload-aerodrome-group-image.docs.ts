import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';

export function UploadAerodromeGroupImageDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Define/atualiza a imagem do grupo',
      description:
        'Requer `group:update`. `multipart/form-data` com a imagem no campo ' +
        '`image` (jpg/png/webp, ≤ 5 MB). Mantém 1 imagem ativa por grupo ' +
        '(substitui a anterior). Retorna o grupo com `imageUrl` presigned.',
    }),
    ApiConsumes('multipart/form-data'),
    ApiParam({ name: 'id', format: 'uuid', description: 'Identificador' }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['image'],
        properties: {
          image: { type: 'string', format: 'binary' },
        },
      },
    }),
    ApiOkResponse({ type: AerodromeGroupResponseDTO }),
    ApiBadRequestResponse({
      description:
        'Imagem ausente, mimetype não suportado (use jpg/png/webp) ou acima de 5 MB.',
    }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({
      description: 'Sem permissão `group:update` ou grupo fora do escopo.',
    }),
    ApiNotFoundResponse({ description: 'Grupo inexistente.' }),
    ApiInternalServerErrorResponse({
      description: 'Falha ao enviar a imagem ao storage (MinIO indisponível).',
    }),
  );
}
