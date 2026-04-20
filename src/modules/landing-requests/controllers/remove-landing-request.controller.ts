import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { RemoveLandingRequestDocs } from '../docs/remove-landing-request.docs';
import { LandingRequestResponseDTO } from '../dtos/landing-request-response.dto';
import { RemoveLandingRequestService } from '../services/remove-landing-request.service';

@ApiTags('Landing Requests')
@Controller('landing-requests')
@UseGuards(AerobiApiKeyGuard)
export class RemoveLandingRequestController {
  constructor(private readonly service: RemoveLandingRequestService) {}

  @Delete(':id')
  @RemoveLandingRequestDocs()
  handle(@Param('id') id: string): Promise<LandingRequestResponseDTO> {
    // TODO: obter deletedBy do contexto autenticado
    return this.service.execute({ id, deletedBy: 'system' });
  }
}
