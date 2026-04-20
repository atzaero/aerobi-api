import type { LandingRequest } from '@/generated/prisma/client';

import { LandingRequestResponseDTO } from '../dtos/landing-request-response.dto';

export class LandingRequestMapper {
  static toApiRow(entity: LandingRequest): LandingRequestResponseDTO {
    // TODO: implementar mapeamento completo
    return { id: entity.id } as LandingRequestResponseDTO;
  }

  static toApiRows(entities: LandingRequest[]): LandingRequestResponseDTO[] {
    return entities.map((e) => LandingRequestMapper.toApiRow(e));
  }
}
