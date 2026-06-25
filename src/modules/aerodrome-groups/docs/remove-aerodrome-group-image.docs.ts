import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';

export function RemoveAerodromeGroupImageDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Remove a imagem ativa do grupo',
      description:
        'Requer `group:update`. Soft-delete da imagem ativa e zera o ' +
        '`imageKey` do grupo (o objeto no MinIO não é apagado). Retorna o ' +
        'grupo atualizado. 404 se não há imagem ativa.',
    }),
    ApiParam({ name: 'id', format: 'uuid', description: 'Identificador' }),
    ApiOkResponse({ type: AerodromeGroupResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({
      description: 'Sem permissão `group:update` ou grupo fora do escopo.',
    }),
    ApiNotFoundResponse({
      description: 'Grupo inexistente ou sem imagem ativa.',
    }),
  );
}
