import type { OperationalAerodrome } from '@/generated/prisma/client';

import { OperationalAerodromeResponseDTO } from '../dtos/operational-aerodrome-response.dto';

export class OperationalAerodromeMapper {
  static toApiRow(
    entity: OperationalAerodrome,
  ): OperationalAerodromeResponseDTO {
    // TODO: implementar mapeamento completo
    return { id: entity.id } as OperationalAerodromeResponseDTO;
  }

  static toApiRows(
    entities: OperationalAerodrome[],
  ): OperationalAerodromeResponseDTO[] {
    return entities.map((e) => OperationalAerodromeMapper.toApiRow(e));
  }
}
