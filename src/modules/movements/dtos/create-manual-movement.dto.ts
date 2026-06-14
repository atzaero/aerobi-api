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
 * Autorização: estas rotas ainda usam `AerobiApiKeyGuard` (header `X-API-Key`),
 * pois ainda não há JWT humano aplicado a este módulo (ver AGENTS.md — auth
 * humana "a migrar no futuro"). Por isso o "inserido por" do manual vem do
 * corpo (`createdBy`) por ora; quando a auth humana chegar a estas rotas, o
 * `createdBy` passará a ser derivado do usuário autenticado, não do body.
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
    description: 'Código ICAO do aeródromo (obrigatório no manual).',
  })
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

  @ApiPropertyOptional({
    description:
      'Identificador do usuário que inseriu o movimento (enviado pelo frontend). ' +
      'Temporário: vem do corpo enquanto não há auth humana neste módulo (ver AGENTS.md).',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  createdBy?: string;
}
