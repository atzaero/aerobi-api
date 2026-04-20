import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { FindAerodromeFeedbackByIdDocs } from '../docs/find-aerodrome-feedback-by-id.docs';
import { AerodromeFeedbackParamDTO } from '../dtos/aerodrome-feedback-param.dto';
import { AerodromeFeedbackResponseDTO } from '../dtos/aerodrome-feedback-response.dto';
import { FindAerodromeFeedbackByIdService } from '../services/find-aerodrome-feedback-by-id.service';

@ApiTags('Aerodrome Feedbacks')
@Controller('aerodrome-feedbacks')
@UseGuards(AerobiApiKeyGuard)
export class FindAerodromeFeedbackByIdController {
  constructor(private readonly service: FindAerodromeFeedbackByIdService) {}

  @Get(':aerodromeFeedbackId')
  @FindAerodromeFeedbackByIdDocs()
  handle(
    @Param() params: AerodromeFeedbackParamDTO,
  ): Promise<AerodromeFeedbackResponseDTO> {
    return this.service.execute({ id: params.aerodromeFeedbackId });
  }
}
