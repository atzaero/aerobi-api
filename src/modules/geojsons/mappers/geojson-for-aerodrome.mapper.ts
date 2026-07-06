import { GeojsonMapFileType } from '@/generated/prisma/client';

import { GeojsonForAerodromeResponseDTO } from '../dtos/geojson-for-aerodrome-response.dto';
import type { GeojsonWithAerodrome } from '../repositories/geojson.repository.interface';
import { normalizeIcao } from '../utils/normalize-icao';

/**
 * Projeta um GeoJSON ativo (READY) + o aeródromo pai no response de leitura por
 * aeródromo. Deriva `icao`/`stateId`/`groupId`; expõe `kind`/`mapFileType` em
 * lowercase; normaliza `generatedAt` para ISO (fallback em `updatedAt`, sempre
 * presente). O `geoJson` já validado (objeto) vem do serviço.
 */
export class GeojsonForAerodromeMapper {
  static toResponse(
    entity: GeojsonWithAerodrome,
    geoJson: Record<string, unknown>,
  ): GeojsonForAerodromeResponseDTO {
    const response = new GeojsonForAerodromeResponseDTO();
    response.docId = entity.aerodromeId;
    response.icao = normalizeIcao(entity.aerodrome.icao);
    response.stateId = entity.aerodrome.group.uf;
    response.groupId = entity.aerodrome.groupId;
    response.kind = entity.kind.toLowerCase();
    response.mapFileType =
      entity.mapFileType === GeojsonMapFileType.KMZ ? 'kmz' : 'kml';
    response.geoJsonBytes = entity.geoJsonBytes;
    response.featureCount = entity.featureCount;
    response.generatedAt = (
      entity.generatedAt ?? entity.updatedAt
    ).toISOString();
    response.geoJson = geoJson;
    return response;
  }
}
