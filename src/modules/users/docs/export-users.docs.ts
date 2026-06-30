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

import { UserRole } from '@/generated/prisma/client';

export function ExportUsersDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Exporta usuários em CSV',
      description:
        'Requer `user:export`. Mesmo escopo/filtros da listagem: COORDINATOR ' +
        'exporta apenas o próprio grupo; ADMIN exporta todos. Formato RFC 4180 ' +
        '+ BOM UTF-8. Colunas: Nome, E-mail, Telefone (E.164), Perfil, Grupo, UF, Criado em (UTC).',
    }),
    ApiProduces('text/csv'),
    ApiQuery({
      name: 'search',
      required: false,
      description: 'Filtra por email ou nome (substring, case-insensitive)',
    }),
    ApiQuery({ name: 'role', required: false, enum: UserRole }),
    ApiQuery({
      name: 'groupId',
      required: false,
      description:
        'Filtra por grupo (livre para ADMIN; ignorado para COORDINATOR)',
    }),
    ApiOkResponse({
      description: 'Arquivo CSV (`text/csv; charset=utf-8`).',
      schema: { type: 'string', format: 'binary' },
    }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `user:export`.' }),
  );
}
