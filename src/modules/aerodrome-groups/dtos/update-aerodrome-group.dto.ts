import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { Uf } from '@/generated/prisma/client';

export class UpdateAerodromeGroupDTO {
  @ApiPropertyOptional({ enum: Uf })
  @IsOptional()
  @IsEnum(Uf)
  uf?: Uf;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  groupName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  ownerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  deletionRequested?: boolean;
}
