import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { BasePaginationQueryDTO } from '@/common/dtos/base-pagination-query.dto';

export class ListOperationalAerodromesQueryDTO extends BasePaginationQueryDTO {
  @ApiPropertyOptional({
    description: 'Filtra pelo grupo de aeródromos',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4')
  groupId?: string;

  @ApiPropertyOptional({
    description: 'Filtra ICAO por substring case insensitive',
    example: 'SD',
  })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  icao?: string;

  @ApiPropertyOptional({ description: 'Filtra por visibilidade pública' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    return value === true || value === 'true' || value === '1';
  })
  @IsBoolean()
  isView?: boolean;
}
