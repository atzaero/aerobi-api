import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { FindPilotLandingByIdDocs } from '../docs/find-pilot-landing-by-id.docs';
import { PilotLandingParamDTO } from '../dtos/pilot-landing-param.dto';
import { PilotLandingResponseDTO } from '../dtos/pilot-landing-response.dto';
import { FindPilotLandingByIdService } from '../services/find-pilot-landing-by-id.service';

@ApiTags('Pilot Landings')
@Controller('pilot-landings')
@UseGuards(AerobiApiKeyGuard)
export class FindPilotLandingByIdController {
  constructor(private readonly service: FindPilotLandingByIdService) {}

  @Get(':pilotLandingId')
  @FindPilotLandingByIdDocs()
  handle(
    @Param() params: PilotLandingParamDTO,
  ): Promise<PilotLandingResponseDTO> {
    return this.service.execute({ id: params.pilotLandingId });
  }
}
