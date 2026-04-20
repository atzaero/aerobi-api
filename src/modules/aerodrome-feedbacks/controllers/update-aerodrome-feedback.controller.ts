import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { UpdateAerodromeFeedbackDocs } from '../docs/update-aerodrome-feedback.docs';
import { AerodromeFeedbackParamDTO } from '../dtos/aerodrome-feedback-param.dto';
import { AerodromeFeedbackResponseDTO } from '../dtos/aerodrome-feedback-response.dto';
import { UpdateAerodromeFeedbackDTO } from '../dtos/update-aerodrome-feedback.dto';
import { UpdateAerodromeFeedbackService } from '../services/update-aerodrome-feedback.service';

@ApiTags('Aerodrome Feedbacks')
@Controller('aerodrome-feedbacks')
@UseGuards(AerobiApiKeyGuard)
export class UpdateAerodromeFeedbackController {
  constructor(private readonly service: UpdateAerodromeFeedbackService) {}

  @Patch(':aerodromeFeedbackId')
  @UpdateAerodromeFeedbackDocs()
  handle(
    @Param() params: AerodromeFeedbackParamDTO,
    @Body() dto: UpdateAerodromeFeedbackDTO,
  ): Promise<AerodromeFeedbackResponseDTO> {
    return this.service.execute({ id: params.aerodromeFeedbackId, ...dto });
  }
}
