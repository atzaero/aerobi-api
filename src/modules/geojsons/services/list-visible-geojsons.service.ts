import { Injectable } from '@nestjs/common';

import { GeojsonForAerodromeResponseDTO } from '../dtos/geojson-for-aerodrome-response.dto';
import { GeojsonForAerodromeMapper } from '../mappers/geojson-for-aerodrome.mapper';
import { GeojsonRepository } from '../repositories/geojson.repository';
import { parseGeoJsonField } from '../utils/geojson-content';

/**
 * Lista GeoJSONs READY de aeródromos visíveis (`isView=true`) para o mapa
 * público. Sem paginação. Itens com `geoJson` inválido são omitidos (não
 * falham o array inteiro com 422/502).
 */
@Injectable()
export class ListVisibleGeojsonsService {
  constructor(private readonly repo: GeojsonRepository) {}

  async execute(): Promise<GeojsonForAerodromeResponseDTO[]> {
    const items = await this.repo.findAllActiveVisible();
    const out: GeojsonForAerodromeResponseDTO[] = [];

    for (const entity of items) {
      const geoJson = parseGeoJsonField(entity.geoJson);
      if (!geoJson) {
        continue;
      }
      out.push(GeojsonForAerodromeMapper.toResponse(entity, geoJson));
    }

    return out;
  }
}
