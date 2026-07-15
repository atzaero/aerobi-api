import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  GeojsonKind,
  GeojsonStatus,
  GeojsonMapFileType,
  type Prisma,
} from '@/generated/prisma/client';

export class GeojsonResponseDTO {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  aerodromeId!: string;

  @ApiProperty({ enum: GeojsonKind })
  kind!: GeojsonKind;

  @ApiProperty({ enum: GeojsonStatus })
  status!: GeojsonStatus;

  @ApiPropertyOptional({
    type: Object,
    nullable: true,
    additionalProperties: true,
  })
  geoJson!: Prisma.JsonValue | null;

  @ApiProperty()
  geoJsonBytes!: number;

  @ApiProperty()
  featureCount!: number;

  @ApiPropertyOptional({ enum: GeojsonMapFileType, nullable: true })
  mapFileType!: GeojsonMapFileType | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  sourceStoragePath!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  sourceUpdatedAt!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  geoJsonStoragePath!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  versionHash!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  errorMessage!: string | null;

  @ApiPropertyOptional({ nullable: true, type: Number })
  processingMs!: number | null;

  @ApiPropertyOptional({ nullable: true, type: Number })
  sourceBytes!: number | null;

  @ApiPropertyOptional({ nullable: true, type: Number })
  kmlTextBytes!: number | null;

  @ApiPropertyOptional({ nullable: true, type: Number })
  zipBytes!: number | null;

  @ApiPropertyOptional({ nullable: true, format: 'date-time', type: String })
  generatedAt!: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  createdBy!: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  updatedBy!: string | null;

  @ApiPropertyOptional({ nullable: true, format: 'date-time', type: String })
  deletedAt!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  deletedBy!: string | null;
}
