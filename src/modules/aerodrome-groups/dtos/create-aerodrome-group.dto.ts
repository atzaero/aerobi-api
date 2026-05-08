import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { Uf } from '@/generated/prisma/client';

export class CreateAerodromeGroupDTO {
  @ApiProperty({ enum: Uf, example: Uf.SP })
  @IsEnum(Uf)
  uf!: Uf;

  @ApiProperty({ description: 'Nome do grupo', example: 'Interior SP' })
  @IsString()
  @MaxLength(500)
  groupName!: string;

  @ApiPropertyOptional({
    description: 'Identificador do proprietário (legado Firebase owner)',
    example: 'uid-xyz',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  ownerId?: string;

  @ApiPropertyOptional({
    description: 'Marcador de pedido de eliminação',
  })
  @IsOptional()
  @IsBoolean()
  deletionRequested?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  createdBy?: string;
}
