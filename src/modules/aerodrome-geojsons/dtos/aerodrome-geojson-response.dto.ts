import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  AerodromeGeojsonKind,
  AerodromeGeojsonStatus,
  GeojsonMapFileType,
  type Prisma,
} from '@/generated/prisma/client';

export class AerodromeGeojsonResponseDTO {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  operationalAerodromeId!: string;

  @ApiProperty({ enum: AerodromeGeojsonKind })
  kind!: AerodromeGeojsonKind;

  @ApiProperty({ enum: AerodromeGeojsonStatus })
  status!: AerodromeGeojsonStatus;

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
