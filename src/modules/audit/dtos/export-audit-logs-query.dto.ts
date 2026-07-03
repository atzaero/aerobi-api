import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import { TrimOptionalString } from '@/common/transform';
import { AuditAction } from '@/generated/prisma/client';

/**
 * Filtros do export CSV de auditoria (`GET /audit-logs/export`) — mesmos da
 * listagem, **sem paginação**: traz todas as linhas do filtro até
 * `EXPORT_MAX_ROWS`.
 */
export class ExportAuditLogsQueryDto {
  @ApiPropertyOptional({
    description:
      'Tipo de entidade (igualdade exata), ex.: `user`, `aerodrome`.',
  })
  @IsOptional()
  @TrimOptionalString()
  @IsString()
  @MaxLength(100)
  entityType?: string;

  @ApiPropertyOptional({
    description: 'E-mail do ator (igualdade exata, não substring).',
  })
  @IsOptional()
  @TrimOptionalString()
  @IsString()
  @MaxLength(255)
  actorEmail?: string;

  @ApiPropertyOptional({ enum: AuditAction })
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @ApiPropertyOptional({
    description:
      'Início do intervalo (ms desde epoch, inclusivo) em `createdAt`.',
    example: 1719792000000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  from?: number;

  @ApiPropertyOptional({
    description: 'Fim do intervalo (ms desde epoch, inclusivo) em `createdAt`.',
    example: 1719878399999,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  to?: number;
}
