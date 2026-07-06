import { ApiProperty } from '@nestjs/swagger';

/**
 * Response de leitura do GeoJSON por aeródromo — paridade com
 * `geojsonAerodromeResponseSchema` do `aerobi-web` (consumido pelo mapa). Campos
 * `icao`/`stateId`/`groupId` são **derivados do aeródromo pai** (o model não os
 * desnormaliza); `kind`/`mapFileType` saem em **lowercase** (`aerodrome_map`,
 * `kml`/`kmz`) por paridade de contrato, embora persistidos em MAIÚSCULAS; e
 * `geoJson` é devolvido como **objeto** (a API guarda `jsonb` — sem `JSON.parse`).
 */
export class GeojsonForAerodromeResponseDTO {
  @ApiProperty({
    format: 'uuid',
    description: 'Identificador do aeródromo (docId, paridade com o web).',
  })
  docId!: string;

  @ApiProperty({ description: 'ICAO do aeródromo (normalizado, maiúsculas).' })
  icao!: string;

  @ApiProperty({ description: 'UF do grupo do aeródromo (ex.: SP).' })
  stateId!: string;

  @ApiProperty({ format: 'uuid', description: 'Grupo do aeródromo.' })
  groupId!: string;

  @ApiProperty({ example: 'aerodrome_map', description: 'Tipo do GeoJSON.' })
  kind!: string;

  @ApiProperty({ enum: ['kml', 'kmz'], description: 'Origem do mapa.' })
  mapFileType!: 'kml' | 'kmz';

  @ApiProperty({
    description: 'Tamanho do GeoJSON serializado em bytes (UTF-8).',
  })
  geoJsonBytes!: number;

  @ApiProperty({ description: 'Número de features do GeoJSON.' })
  featureCount!: number;

  @ApiProperty({
    format: 'date-time',
    description: 'Instante da geração (ISO 8601).',
  })
  generatedAt!: string;

  @ApiProperty({
    type: Object,
    additionalProperties: true,
    description: 'Objeto GeoJSON RFC 7946 (FeatureCollection).',
  })
  geoJson!: Record<string, unknown>;
}
