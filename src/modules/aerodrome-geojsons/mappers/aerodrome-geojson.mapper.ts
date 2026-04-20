import type { AerodromeGeojson } from '@/generated/prisma/client';

import { AerodromeGeojsonResponseDTO } from '../dtos/aerodrome-geojson-response.dto';

export class AerodromeGeojsonMapper {
  static toApiRow(entity: AerodromeGeojson): AerodromeGeojsonResponseDTO {
    // TODO: implementar mapeamento completo
    return { id: entity.id } as AerodromeGeojsonResponseDTO;
  }

  static toApiRows(
    entities: AerodromeGeojson[],
  ): AerodromeGeojsonResponseDTO[] {
    return entities.map((e) => AerodromeGeojsonMapper.toApiRow(e));
  }
}
