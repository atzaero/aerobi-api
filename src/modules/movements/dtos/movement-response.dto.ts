import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  ConformityStatus,
  MovementSource,
  MovementType,
} from '@/generated/prisma/enums';

import { MovementAircraftSnapshotResponseDTO } from './movement-aircraft-snapshot-response.dto';

/**
 * Resposta (camelCase) de um movimento nas rotas de consulta canônicas
 * (`GET /movements`, `GET /movements/:id`, `DELETE /movements/:id`) e nos aliases
 * deprecados em `/readings`. `imageUrl` é uma presigned URL temporária (ou
 * `null`). Inclui `operationType`, `source` e o `aircraftSnapshot` (RAB) quando
 * presente. Não expõe `confidence`. Inclui `deletedAt`/`deletedBy` (nulos para
 * movimentos ativos) para o frontend exibir o estado de exclusão lógica.
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

  @ApiProperty({
    enum: ConformityStatus,
    example: ConformityStatus.PENDING,
    description:
      'Conformidade do movimento perante o pedido de aterragem aprovado.',
  })
  conformityStatus!: ConformityStatus;

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

  @ApiProperty({
    type: String,
    format: 'date-time',
    nullable: true,
    description: 'Instante da exclusão lógica (soft delete), ou null se ativo.',
  })
  deletedAt!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Quem realizou a exclusão lógica, ou null se ativo.',
  })
  deletedBy!: string | null;
}
