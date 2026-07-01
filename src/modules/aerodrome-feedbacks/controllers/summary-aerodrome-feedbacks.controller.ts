import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { SummaryAerodromeFeedbacksDocs } from '../docs/summary-aerodrome-feedbacks.docs';
import { AerodromeFeedbackSummaryQueryDTO } from '../dtos/aerodrome-feedback-summary-query.dto';
import { AerodromeFeedbackSummaryResponseDTO } from '../dtos/aerodrome-feedback-summary-response.dto';
import { SummaryAerodromeFeedbacksService } from '../services/summary-aerodrome-feedbacks.service';

/**
 * `GET /aerodrome-feedbacks/summary` — resumo público de contadores. Deve ser
 * registrado **antes** do `FindAerodromeFeedbackByIdController` no módulo (Express
 * 5 não tem regex no param), senão `summary` cai no handler de `:id`. Público (sem
 * JWT/RBAC), protegido só pela `X-API-Key` como o envio.
 */
@ApiTags('Aerodrome Feedbacks')
@Controller('aerodrome-feedbacks')
@UseGuards(AerobiApiKeyGuard)
export class SummaryAerodromeFeedbacksController {
  constructor(private readonly service: SummaryAerodromeFeedbacksService) {}

  @Get('summary')
  @SummaryAerodromeFeedbacksDocs()
  handle(
    @Query() query: AerodromeFeedbackSummaryQueryDTO,
  ): Promise<AerodromeFeedbackSummaryResponseDTO> {
    return this.service.execute(query);
  }
}
