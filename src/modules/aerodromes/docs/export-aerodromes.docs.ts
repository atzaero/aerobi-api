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

export function ExportAerodromesDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Exporta aeródromos em CSV',
      description:
        'Requer `aerodrome:list` (mesmo gate da listagem, paridade com o web). ' +
        'Mesmo escopo/filtros da listagem: ADMIN exporta todos; COORDINATOR/' +
        'OPERATOR/TECHNICAL só o próprio grupo. Formato RFC 4180 + BOM UTF-8, com ' +
        'as 11 colunas do web; teto de 50.000 linhas (sinalizado via ' +
        '`X-Export-Truncated`).',
    }),
    ApiProduces('text/csv'),
    ApiQuery({
      name: 'uf',
      required: false,
      enum: Uf,
      description: 'Filtra pela UF do grupo',
    }),
    ApiQuery({
      name: 'search',
      required: false,
      description: 'Substring (case-insensitive) em ICAO, nome ou município',
    }),
    ApiQuery({
      name: 'isOpen',
      required: false,
      enum: ['true', 'false'],
      description: 'Filtra por aeródromo aberto',
    }),
    ApiQuery({
      name: 'isView',
      required: false,
      enum: ['true', 'false'],
      description: 'Filtra por visibilidade pública',
    }),
    ApiQuery({
      name: 'groupId',
      required: false,
      format: 'uuid',
      description: 'Filtra pelo grupo (efetivo apenas para ADMIN)',
    }),
    ApiOkResponse({
      description: 'Arquivo CSV (`text/csv; charset=utf-8`).',
      schema: { type: 'string', format: 'binary' },
    }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `aerodrome:list`.' }),
  );
}
