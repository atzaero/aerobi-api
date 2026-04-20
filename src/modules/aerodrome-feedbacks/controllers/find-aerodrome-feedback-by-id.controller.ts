import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { FindAerodromeFeedbackByIdDocs } from '../docs/find-aerodrome-feedback-by-id.docs';
import { AerodromeFeedbackResponseDTO } from '../dtos/aerodrome-feedback-response.dto';
import { FindAerodromeFeedbackByIdService } from '../services/find-aerodrome-feedback-by-id.service';

@ApiTags('Aerodrome Feedbacks')
@Controller('aerodrome-feedbacks')
@UseGuards(AerobiApiKeyGuard)
export class FindAerodromeFeedbackByIdController {
  constructor(private readonly service: FindAerodromeFeedbackByIdService) {}

  @Get(':id')
  @FindAerodromeFeedbackByIdDocs()
  handle(@Param('id') id: string): Promise<AerodromeFeedbackResponseDTO> {
    return this.service.execute({ id });
  }
}
