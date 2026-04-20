import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { RemovePilotLandingDocs } from '../docs/remove-pilot-landing.docs';
import { PilotLandingParamDTO } from '../dtos/pilot-landing-param.dto';
import { PilotLandingResponseDTO } from '../dtos/pilot-landing-response.dto';
import { RemovePilotLandingService } from '../services/remove-pilot-landing.service';

@ApiTags('Pilot Landings')
@Controller('pilot-landings')
@UseGuards(AerobiApiKeyGuard)
export class RemovePilotLandingController {
  constructor(private readonly service: RemovePilotLandingService) {}

  @Delete(':pilotLandingId')
  @RemovePilotLandingDocs()
  handle(
    @Param() params: PilotLandingParamDTO,
  ): Promise<PilotLandingResponseDTO> {
    // TODO: obter deletedBy do contexto autenticado
    return this.service.execute({
      id: params.pilotLandingId,
      deletedBy: 'system',
    });
  }
}
