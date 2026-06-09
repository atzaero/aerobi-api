import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { BasePaginationQueryDTO } from '@/common/dtos/base-pagination-query.dto';
import { TrimOptionalString } from '@/common/transform';
import { UserRole } from '@/generated/prisma/client';

export class ListUsersQueryDto extends BasePaginationQueryDTO {
  @ApiPropertyOptional({ description: 'Filtra por email ou nome (ILIKE).' })
  @IsOptional()
  @TrimOptionalString()
  @IsString()
  @MaxLength(255)
  search?: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  /**
   * Filtra por grupo de aeródromos. Livre para ADMIN; para COORDINATOR é
   * **sobrescrito** pelo service com o próprio grupo (não dá para listar fora dele).
   */
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  aerodromeGroupId?: string;
}
