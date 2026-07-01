import { Injectable } from '@nestjs/common';

import { AerodromeFeedbackSummaryQueryDTO } from '../dtos/aerodrome-feedback-summary-query.dto';
import { AerodromeFeedbackSummaryResponseDTO } from '../dtos/aerodrome-feedback-summary-response.dto';
import { AerodromeFeedbackMapper } from '../mappers/aerodrome-feedback.mapper';
import { AerodromeFeedbackRepository } from '../repositories/aerodrome-feedback.repository';

/**
 * Resumo público de contadores de um aeródromo. Agrega no banco (`groupBy` por
 * `rating`, só ativos) — sem full-scan. Espelha o `summary` do `aerobi-web`
 * (aeródromo sem feedbacks devolve zeros; não valida a existência do aeródromo,
 * já que não vaza nada e evita uma query extra).
 */
@Injectable()
export class SummaryAerodromeFeedbacksService {
  constructor(private readonly repo: AerodromeFeedbackRepository) {}

  async execute(
    query: AerodromeFeedbackSummaryQueryDTO,
  ): Promise<AerodromeFeedbackSummaryResponseDTO> {
    const counts = await this.repo.summaryByAerodrome(query.aerodromeId);
    return AerodromeFeedbackMapper.toSummary(query.aerodromeId, counts);
  }
}
