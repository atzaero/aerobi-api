import { Injectable } from '@nestjs/common';

import { FeedbackSummaryQueryDTO } from '../dtos/feedback-summary-query.dto';
import { FeedbackSummaryResponseDTO } from '../dtos/feedback-summary-response.dto';
import { FeedbackMapper } from '../mappers/feedback.mapper';
import { FeedbackRepository } from '../repositories/feedback.repository';

/**
 * Resumo público de contadores de um aeródromo. Agrega no banco (`groupBy` por
 * `rating`, só ativos) — sem full-scan. Espelha o `summary` do `aerobi-web`
 * (aeródromo sem feedbacks devolve zeros; não valida a existência do aeródromo,
 * já que não vaza nada e evita uma query extra).
 */
@Injectable()
export class SummaryFeedbacksService {
  constructor(private readonly repo: FeedbackRepository) {}

  async execute(
    query: FeedbackSummaryQueryDTO,
  ): Promise<FeedbackSummaryResponseDTO> {
    const counts = await this.repo.summaryByAerodrome(query.aerodromeId);
    return FeedbackMapper.toSummary(query.aerodromeId, counts);
  }
}
