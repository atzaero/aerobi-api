import { ApiProperty } from '@nestjs/swagger';

import { UserRole } from '@/generated/prisma/client';

import type { ResolvedPermissions } from '../permissions';

export class MeResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'email' })
  email!: string;

  @ApiProperty({ enum: UserRole })
  role!: UserRole;

  /**
   * Permissões já resolvidas para o `role` — `{ subject: action[] }`. O front
   * usa para mostrar/ocultar ações sem reimplementar `can()`. Subjects sem
   * nenhuma ação permitida são omitidos (deny-by-default).
   */
  @ApiProperty({
    description:
      'Permissões resolvidas para o role autenticado, no formato ' +
      '`{ subject: action[] }`. Apenas subjects com ao menos uma ação ' +
      'permitida aparecem.',
    type: 'object',
    additionalProperties: { type: 'array', items: { type: 'string' } },
    example: {
      aerodrome: ['list', 'read', 'update-observation'],
      technical_visit: ['list', 'read', 'create', 'update', 'delete', 'export'],
      dashboard: ['read'],
    },
  })
  permissions!: ResolvedPermissions;
}
