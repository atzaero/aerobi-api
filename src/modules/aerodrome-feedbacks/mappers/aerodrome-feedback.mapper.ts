import type { AerodromeFeedback } from '@/generated/prisma/client';

import { AerodromeFeedbackResponseDTO } from '../dtos/aerodrome-feedback-response.dto';

export class AerodromeFeedbackMapper {
  static toApiRow(entity: AerodromeFeedback): AerodromeFeedbackResponseDTO {
    // TODO: implementar mapeamento completo
    return { id: entity.id } as AerodromeFeedbackResponseDTO;
  }

  static toApiRows(
    entities: AerodromeFeedback[],
  ): AerodromeFeedbackResponseDTO[] {
    return entities.map((e) => AerodromeFeedbackMapper.toApiRow(e));
  }
}
