import { ApiProperty } from '@nestjs/swagger';

import type { GeojsonKind } from '@/generated/prisma/client';

/** Valores de `kind` no contrato público (lowercase do enum Prisma). */
export type AerodromePublicGeojsonKind = Lowercase<GeojsonKind>;

/**
 * Subset do GeoJSON operacional aninhado no aeródromo público — só o necessário
 * para renderizar a layer no mapa. Omitidos: ids derivados do pai (`docId`/`icao`/
 * `stateId`/`groupId`), métricas e auditoria.
 */
export class AerodromePublicGeojsonDTO {
  @ApiProperty({
    enum: ['aerodrome_map'],
    example: 'aerodrome_map',
    description: 'Tipo do GeoJSON (lowercase do enum persistido).',
  })
  kind!: AerodromePublicGeojsonKind;

  @ApiProperty({ enum: ['kml', 'kmz'], description: 'Origem do mapa.' })
  mapFileType!: 'kml' | 'kmz';

  @ApiProperty({
    type: Object,
    additionalProperties: true,
    example: { type: 'FeatureCollection', features: [] },
    description: 'Objeto GeoJSON RFC 7946 (FeatureCollection).',
  })
  geoJson!: Record<string, unknown>;
}
