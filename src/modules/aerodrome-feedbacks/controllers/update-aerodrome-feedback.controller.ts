import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { UpdateAerodromeFeedbackDocs } from '../docs/update-aerodrome-feedback.docs';
import { AerodromeFeedbackResponseDTO } from '../dtos/aerodrome-feedback-response.dto';
import { UpdateAerodromeFeedbackDTO } from '../dtos/update-aerodrome-feedback.dto';
import { UpdateAerodromeFeedbackService } from '../services/update-aerodrome-feedback.service';

@ApiTags('Aerodrome Feedbacks')
@Controller('aerodrome-feedbacks')
@UseGuards(AerobiApiKeyGuard)
export class UpdateAerodromeFeedbackController {
  constructor(private readonly service: UpdateAerodromeFeedbackService) {}

  @Patch(':id')
  @UpdateAerodromeFeedbackDocs()
  handle(
    @Param('id') id: string,
    @Body() dto: UpdateAerodromeFeedbackDTO,
  ): Promise<AerodromeFeedbackResponseDTO> {
    return this.service.execute({ id, ...dto });
  }
}
