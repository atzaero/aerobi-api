import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { CreateAerodromeFeedbackDocs } from '../docs/create-aerodrome-feedback.docs';
import { AerodromeFeedbackResponseDTO } from '../dtos/aerodrome-feedback-response.dto';
import { CreateAerodromeFeedbackDTO } from '../dtos/create-aerodrome-feedback.dto';
import { CreateAerodromeFeedbackService } from '../services/create-aerodrome-feedback.service';

@ApiTags('Aerodrome Feedbacks')
@Controller('aerodrome-feedbacks')
@UseGuards(AerobiApiKeyGuard)
export class CreateAerodromeFeedbackController {
  constructor(private readonly service: CreateAerodromeFeedbackService) {}

  @Post()
  @CreateAerodromeFeedbackDocs()
  handle(
    @Body() dto: CreateAerodromeFeedbackDTO,
  ): Promise<AerodromeFeedbackResponseDTO> {
    return this.service.execute(dto);
  }
}
