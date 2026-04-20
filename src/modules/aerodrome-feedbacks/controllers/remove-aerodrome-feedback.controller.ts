import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { RemoveAerodromeFeedbackDocs } from '../docs/remove-aerodrome-feedback.docs';
import { AerodromeFeedbackResponseDTO } from '../dtos/aerodrome-feedback-response.dto';
import { RemoveAerodromeFeedbackService } from '../services/remove-aerodrome-feedback.service';

@ApiTags('Aerodrome Feedbacks')
@Controller('aerodrome-feedbacks')
@UseGuards(AerobiApiKeyGuard)
export class RemoveAerodromeFeedbackController {
  constructor(private readonly service: RemoveAerodromeFeedbackService) {}

  @Delete(':id')
  @RemoveAerodromeFeedbackDocs()
  handle(@Param('id') id: string): Promise<AerodromeFeedbackResponseDTO> {
    // TODO: obter deletedBy do contexto autenticado
    return this.service.execute({ id, deletedBy: 'system' });
  }
}
