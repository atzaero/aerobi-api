import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Uf } from '@/generated/prisma/client';

import { AerodromePublicGeojsonDTO } from './aerodrome-public-geojson.dto';

/**
 * Resposta pública de aeródromo (mapa/ficha). Subset de `AerodromeResponseDTO`
 * sem auditoria, PII (`emergencyPhone`), URLs de documentos administrativos nem
 * `isView` (sempre `true` nestes endpoints). Mantém `groupId` — contrato da UI
 * do mapa/ficha no aerobi-web. Inclui `geojson` aninhado (layer operacional) ou
 * `null` quando ausente/não READY.
 */
export class AerodromePublicResponseDTO {
  @ApiProperty({
    format: 'uuid',
    example: '9f1e2d3c-4b5a-4c6d-8e7f-0a1b2c3d4e5f',
  })
  id!: string;

  @ApiProperty({
    format: 'uuid',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  groupId!: string;

  @ApiPropertyOptional({
    enum: Uf,
    nullable: true,
    example: 'PI',
    description: 'UF derivada do grupo (não é coluna do aeródromo)',
  })
  uf!: Uf | null;

  @ApiProperty({ example: 'SJ4E' })
  icao!: string;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'PI0055' })
  ciad!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String, example: '13/31' })
  designation!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String, example: '1234' })
  length!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String, example: '20' })
  width!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    type: String,
    example: '5700Kg/1.25MPa',
  })
  resistance!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String, example: 'Asfalto' })
  surface!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String, example: '88' })
  altitude!: string | null;

  @ApiProperty({ example: 'Barras' })
  name!: string;

  @ApiPropertyOptional({ nullable: true, type: String, example: 'BARRAS' })
  municipality!: string | null;

  @ApiProperty({ example: '04°12\'16.0"S' })
  latitude!: string;

  @ApiProperty({ example: '042°15\'05.0"W' })
  longitude!: string;

  @ApiPropertyOptional({ nullable: true, type: String, example: null })
  latitudeFormatted!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String, example: null })
  longitudeFormatted!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String, example: 'VFR' })
  operation!: string | null;

  @ApiPropertyOptional({ nullable: true, type: Boolean, example: true })
  lit!: boolean | null;

  @ApiPropertyOptional({ nullable: true, type: Boolean, example: false })
  fueling!: boolean | null;

  @ApiPropertyOptional({
    nullable: true,
    type: String,
    example: 'Atenção à linha elétrica na aproximação 31',
  })
  observation!: string | null;

  @ApiPropertyOptional({ nullable: true, type: Boolean, example: false })
  construction!: boolean | null;

  @ApiProperty({ example: true })
  isOpen!: boolean;

  @ApiPropertyOptional({ nullable: true, type: String, example: '9133' })
  weatherStationCode!: string | null;

  @ApiPropertyOptional({ nullable: true, type: Boolean, example: true })
  weatherStationDisplay!: boolean | null;

  @ApiPropertyOptional({ nullable: true, type: String, example: null })
  fileType!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String, example: null })
  imgUrl!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String, example: null })
  kmlUrl!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String, example: null })
  weatherUrl!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String, example: null })
  windUrl!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String, example: null })
  videoUrl!: string | null;

  @ApiProperty({
    type: AerodromePublicGeojsonDTO,
    nullable: true,
    description:
      'Layer GeoJSON operacional (READY + parseável + `mapFileType` definido). Sempre presente na chave; `null` se ausente ou inválido.',
  })
  geojson!: AerodromePublicGeojsonDTO | null;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-06-01T12:00:00.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-06-02T12:00:00.000Z',
  })
  updatedAt!: string;
}
