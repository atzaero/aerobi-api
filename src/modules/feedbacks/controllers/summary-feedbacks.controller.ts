import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { SummaryFeedbacksDocs } from '../docs/summary-feedbacks.docs';
import { FeedbackSummaryQueryDTO } from '../dtos/feedback-summary-query.dto';
import { FeedbackSummaryResponseDTO } from '../dtos/feedback-summary-response.dto';
import { SummaryFeedbacksService } from '../services/summary-feedbacks.service';

/**
 * `GET /feedbacks/summary` — resumo público de contadores. Deve ser
 * registrado **antes** do `FindFeedbackByIdController` no módulo (Express
 * 5 não tem regex no param), senão `summary` cai no handler de `:id`. Público (sem
 * JWT/RBAC), protegido só pela `X-API-Key` como o envio.
 */
@ApiTags('Feedbacks')
@Controller('feedbacks')
@UseGuards(AerobiApiKeyGuard)
export class SummaryFeedbacksController {
  constructor(private readonly service: SummaryFeedbacksService) {}

  @Get('summary')
  @SummaryFeedbacksDocs()
  handle(
    @Query() query: FeedbackSummaryQueryDTO,
  ): Promise<FeedbackSummaryResponseDTO> {
    return this.service.execute(query);
  }
}
