import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { Uf } from '@/generated/prisma/client';

export function ExportAerodromeGroupsDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Exporta os grupos de aeródromo em CSV',
      description:
        'Requer `group:export`. Mesmo escopo/filtros da listagem: COORDINATOR ' +
        'exporta apenas o próprio grupo; ADMIN exporta todos. Formato RFC 4180 ' +
        '+ BOM UTF-8, com todas as colunas da tabela de grupos.',
    }),
    ApiProduces('text/csv'),
    ApiQuery({
      name: 'uf',
      required: false,
      enum: Uf,
      description: 'Filtra pelo estado',
    }),
    ApiQuery({
      name: 'name',
      required: false,
      description: 'Filtra por nome do grupo (substring, case-insensitive)',
    }),
    ApiOkResponse({
      description: 'Arquivo CSV (`text/csv; charset=utf-8`).',
      schema: { type: 'string', format: 'binary' },
    }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `group:export`.' }),
  );
}
