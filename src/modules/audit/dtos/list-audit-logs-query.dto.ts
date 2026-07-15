import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import { BasePaginationQueryDTO } from '@/common/dtos/base-pagination-query.dto';
import { TrimOptionalString } from '@/common/transform';
import { AuditAction } from '@/generated/prisma/client';

/**
 * Filtros da listagem de auditoria (`GET /audit-logs`). Paridade com o
 * `aerobi-web`: igualdade **exata** em `entityType`/`actorEmail`/`action`;
 * `from`/`to` em **ms desde epoch** aplicados como range **inclusivo** sobre
 * `createdAt`. `limit` sobrescreve o default da base para **20 (máx 100)**,
 * espelhando `PAGINATION_LIMITS` do web.
 */
export class ListAuditLogsQueryDto extends BasePaginationQueryDTO {
  @ApiPropertyOptional({ example: 20, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

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
