import type { PilotLanding } from '@/generated/prisma/client';

import { PilotLandingResponseDTO } from '../dtos/pilot-landing-response.dto';

export class PilotLandingMapper {
  static toApiRow(entity: PilotLanding): PilotLandingResponseDTO {
    // TODO: implementar mapeamento completo
    return { id: entity.id };
  }

  static toApiRows(entities: PilotLanding[]): PilotLandingResponseDTO[] {
    return entities.map((e) => PilotLandingMapper.toApiRow(e));
  }
}
