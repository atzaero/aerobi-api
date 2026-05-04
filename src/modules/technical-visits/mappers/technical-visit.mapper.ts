import type { TechnicalVisit } from '@/generated/prisma/client';

import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';

export class TechnicalVisitMapper {
  static toApiRow(entity: TechnicalVisit): TechnicalVisitResponseDTO {
    // TODO: implementar mapeamento completo
    return { id: entity.id };
  }

  static toApiRows(entities: TechnicalVisit[]): TechnicalVisitResponseDTO[] {
    return entities.map((e) => TechnicalVisitMapper.toApiRow(e));
  }
}
