import {
  GeojsonKind,
  GeojsonMapFileType,
  GeojsonStatus,
} from '@/generated/prisma/client';
import { parseGeoJsonField } from '@/modules/geojsons/utils/geojson-content';

import {
  AerodromePublicGeojsonDTO,
  type AerodromePublicGeojsonKind,
} from '../dtos/aerodrome-public-geojson.dto';
import type { AerodromeVisibleWithGroup } from '../repositories/aerodrome.repository.interface';

type VisibleGeojsonRelation = AerodromeVisibleWithGroup['geojson'];

const PUBLIC_KIND: Record<GeojsonKind, AerodromePublicGeojsonKind> = {
  [GeojsonKind.AERODROME_MAP]: 'aerodrome_map',
};

/**
 * Projeta o GeoJSON aninhado no response público do aeródromo. Ausente, não
 * READY, `mapFileType` nulo ou `geoJson` ilegível → `null` (a ficha/marcador
 * continua 200).
 */
export class AerodromePublicGeojsonMapper {
  static toPublic(
    geojson: VisibleGeojsonRelation,
  ): AerodromePublicGeojsonDTO | null {
    if (!geojson || geojson.status !== GeojsonStatus.READY) {
      return null;
    }

    if (geojson.mapFileType == null) {
      return null;
    }

    const parsed = parseGeoJsonField(geojson.geoJson);
    if (!parsed) {
      return null;
    }

    const row = new AerodromePublicGeojsonDTO();
    row.kind = PUBLIC_KIND[geojson.kind];
    row.mapFileType =
      geojson.mapFileType === GeojsonMapFileType.KMZ ? 'kmz' : 'kml';
    row.geoJson = parsed;
    return row;
  }
}
