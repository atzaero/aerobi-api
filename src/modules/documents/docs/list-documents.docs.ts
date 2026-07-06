import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { PaginationMetadataUtil } from '@/common/utils/pagination.util';

import { DocumentResponseDTO } from '../dtos/document-response.dto';
import { DocumentsPaginatedResponseDTO } from '../dtos/documents-paginated-response.dto';
import { DOCUMENT_TYPE_API_VALUES } from '../utils/document-type';

export function ListDocumentsDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiExtraModels(
      PaginationMetadataUtil,
      DocumentResponseDTO,
      DocumentsPaginatedResponseDTO,
    ),
    ApiOperation({
      summary: 'Lista paginada de documentos',
      description:
        'Requer `document:list`. Escopo por grupo do ator (ADMIN vê tudo). ' +
        'Filtros `aerodromeId`/`type`/`search` (substring no nome); ordena por ' +
        '`createdAt DESC`.',
    }),
    ApiQuery({ name: 'page', required: false, example: 1 }),
    ApiQuery({ name: 'limit', required: false, example: 20 }),
    ApiQuery({ name: 'aerodromeId', required: false, format: 'uuid' }),
    ApiQuery({ name: 'type', required: false, enum: DOCUMENT_TYPE_API_VALUES }),
    ApiQuery({ name: 'search', required: false }),
    ApiOkResponse({ type: DocumentsPaginatedResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `document:list`.' }),
  );
}
