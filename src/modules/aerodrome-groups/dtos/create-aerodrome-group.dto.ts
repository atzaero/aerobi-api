import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { TrimOptionalString, TrimString } from '@/common/transform';
import { Uf } from '@/generated/prisma/client';

/**
 * Criação de grupo. `createdBy` não vive aqui: é derivado do usuário autenticado
 * (`@CurrentUser().id`), nunca do corpo da requisição.
 */
export class CreateAerodromeGroupDTO {
  @ApiProperty({ enum: Uf, example: Uf.SP })
  @IsEnum(Uf)
  uf!: Uf;

  @ApiProperty({ description: 'Nome do grupo', example: 'Interior SP' })
  @TrimString()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  name!: string;

  @ApiPropertyOptional({
    description: 'Identificador do proprietário (legado Firebase owner)',
    example: 'uid-xyz',
  })
  @IsOptional()
  @TrimOptionalString()
  @IsString()
  @MaxLength(255)
  ownerId?: string;

  @ApiPropertyOptional({
    description: 'Marcador de pedido de eliminação',
  })
  @IsOptional()
  @IsBoolean()
  deletionRequested?: boolean;
}
