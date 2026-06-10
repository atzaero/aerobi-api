import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { MovementSource, MovementType } from '@/generated/prisma/enums';

import { MovementAircraftSnapshotResponseDTO } from './movement-aircraft-snapshot-response.dto';

/**
 * Resposta (camelCase) de um movimento nas rotas de consulta canônicas
 * (`GET /movements`, `GET /movements/:id`, `DELETE /movements/:id`) e nos aliases
 * deprecados em `/readings`. `imageUrl` é uma presigned URL temporária (ou
 * `null`). Inclui `operationType`, `source` e o `aircraftSnapshot` (RAB) quando
 * presente. Não expõe `confidence`.
 */
export class MovementResponseDTO {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'PR-ZTT' })
  registration!: string;

  @ApiProperty({ enum: MovementType, example: MovementType.LANDING })
  operationType!: MovementType;

  @ApiProperty({ enum: MovementSource, example: MovementSource.AUTOMATIC })
  source!: MovementSource;

  @ApiProperty({ type: String, format: 'date-time' })
  readingDatetime!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  readingStatus!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  revisorId!: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Presigned URL da imagem (expira em ~1h) ou null.',
  })
  imageUrl!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  comments!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  aerodrome!: string | null;

  @ApiPropertyOptional({
    type: MovementAircraftSnapshotResponseDTO,
    nullable: true,
    description: 'Snapshot RAB da aeronave no instante do movimento, ou null.',
  })
  aircraftSnapshot!: MovementAircraftSnapshotResponseDTO | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: string;
}
