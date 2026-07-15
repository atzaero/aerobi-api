import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { AuditAction, UserRole } from '@/generated/prisma/client';

/**
 * Projeção de um registro de auditoria na resposta HTTP. Espelha a interface
 * `AuditLog` do `aerobi-web` **sem** `entityRef` (path Firestore, descartado).
 * `before`/`after`/`metadata` são JSON opaco (recortes parciais); `createdAt` em
 * ISO 8601 UTC.
 */
export class AuditLogResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiPropertyOptional({
    nullable: true,
    description: 'ator (users.id ou nulo).',
  })
  actorId!: string | null;

  @ApiPropertyOptional({ nullable: true, format: 'email' })
  actorEmail!: string | null;

  @ApiPropertyOptional({ enum: UserRole, nullable: true })
  actorRole!: UserRole | null;

  @ApiProperty({ enum: AuditAction })
  action!: AuditAction;

  @ApiProperty({ example: 'user' })
  entityType!: string;

  @ApiProperty({ format: 'uuid' })
  entityId!: string;

  @ApiPropertyOptional({
    nullable: true,
    type: 'object',
    additionalProperties: true,
    description: 'Snapshot parcial antes da ação (null em CREATE).',
  })
  before!: unknown;

  @ApiPropertyOptional({
    nullable: true,
    type: 'object',
    additionalProperties: true,
    description: 'Snapshot parcial após a ação (null em DELETE).',
  })
  after!: unknown;

  @ApiPropertyOptional({
    nullable: true,
    type: 'object',
    additionalProperties: true,
    description: 'Pares extras (groupId/uf/scope/…) para rastreio.',
  })
  metadata!: unknown;

  @ApiPropertyOptional({ nullable: true })
  ipAddress!: string | null;

  @ApiPropertyOptional({ nullable: true })
  userAgent!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
}
