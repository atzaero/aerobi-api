import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  Allow,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

import {
  AerodromeGeojsonKind,
  AerodromeGeojsonStatus,
  GeojsonMapFileType,
} from '@/generated/prisma/client';

export class CreateAerodromeGeojsonDTO {
  @ApiProperty({
    description: 'Aeródromo operacional ao qual está ligado este GeoJSON (1:1)',
    format: 'uuid',
  })
  @IsUUID('4')
  operationalAerodromeId!: string;

  @ApiProperty({ enum: AerodromeGeojsonKind })
  @IsEnum(AerodromeGeojsonKind)
  kind!: AerodromeGeojsonKind;

  @ApiProperty({ enum: AerodromeGeojsonStatus })
  @IsEnum(AerodromeGeojsonStatus)
  status!: AerodromeGeojsonStatus;

  @ApiPropertyOptional({
    description:
      'Objeto GeoJSON RFC 7946 (FeatureCollection etc.) quando presente inline',
    type: Object,
    additionalProperties: true,
  })
  @IsOptional()
  @Allow()
  geoJson?: unknown;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  geoJsonBytes?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  featureCount?: number;

  @ApiPropertyOptional({ enum: GeojsonMapFileType })
  @IsOptional()
  @IsEnum(GeojsonMapFileType)
  mapFileType?: GeojsonMapFileType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sourceStoragePath?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  sourceUpdatedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  geoJsonStoragePath?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  versionHash?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  processingMs?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sourceBytes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  kmlTextBytes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  zipBytes?: number;

  @ApiPropertyOptional({ example: '2024-06-01T12:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  generatedAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  createdBy?: string;
}
