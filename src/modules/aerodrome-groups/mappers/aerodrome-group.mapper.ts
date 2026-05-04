import type { AerodromeGroup } from '@/generated/prisma/client';

import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';

export class AerodromeGroupMapper {
  static toApiRow(entity: AerodromeGroup): AerodromeGroupResponseDTO {
    // TODO: implementar mapeamento completo
    return { id: entity.id };
  }

  static toApiRows(entities: AerodromeGroup[]): AerodromeGroupResponseDTO[] {
    return entities.map((e) => AerodromeGroupMapper.toApiRow(e));
  }
}
