import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { MovementSource, MovementType } from '@/generated/prisma/enums';

/**
 * Item enxuto de `GET /movements` (e do alias deprecado `GET /readings`) — só os
 * campos que o card da lista exibe. Omite o `aircraftSnapshot` (RAB), o
 * `readingStatus`, o `revisorId`, os `comments` e os timestamps `createdAt` /
 * `updatedAt`, todos disponíveis apenas no detalhe `GET /movements/:id`.
 * `imageUrl` é uma presigned URL temporária (ou `null`).
 */
export class MovementListItemDTO {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'PR-ZTT' })
  registration!: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'ICAO do aeródromo, ou null.',
  })
  aerodrome!: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  readingDatetime!: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Presigned URL da imagem (expira em ~1h) ou null.',
  })
  imageUrl!: string | null;

  @ApiProperty({ enum: MovementType, example: MovementType.LANDING })
  operationType!: MovementType;

  @ApiProperty({ enum: MovementSource, example: MovementSource.AUTOMATIC })
  source!: MovementSource;
}
