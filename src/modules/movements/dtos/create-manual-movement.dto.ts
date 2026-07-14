import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { MovementType } from '@/generated/prisma/enums';

/**
 * Corpo do `POST /movements` (multipart/form-data) — criação MANUAL de um
 * movimento pela interface humana. Diferente da ingestão automática
 * (`POST /readings`): aqui o `operationType` é obrigatório (vem do formulário)
 * e não há `confidence`.
 *
 * Autorização: JWT humano (`JwtAuthGuard` + RBAC `movement:create`). O "inserido
 * por" (`createdBy`) é derivado do usuário autenticado — não vem no corpo.
 */
export class CreateManualMovementDTO {
  @ApiProperty({
    example: 'PR-ZTT',
    description:
      'Matrícula da aeronave. Aceita com/sem hífen; é normalizada (sem hífen, maiúsculas) antes de ser persistida e retornada.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  registration!: string;

  @ApiProperty({
    example: '2026-06-08T16:52:39Z',
    description: 'Data/hora do movimento (ISO 8601).',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? new Date(value) : (value as Date),
  )
  @IsDate()
  reading_datetime!: Date;

  @ApiProperty({
    example: 'SSCF',
    description:
      'Código ICAO do aeródromo (obrigatório no manual; normalizado em maiúsculas).',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : (value as string),
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  aerodrome!: string;

  @ApiProperty({
    enum: MovementType,
    example: MovementType.LANDING,
    description: 'Pouso ou decolagem — informado pelo operador.',
  })
  @IsEnum(MovementType)
  operationType!: MovementType;

  @ApiPropertyOptional({ description: 'Comentários do operador.' })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  comments?: string;
}
