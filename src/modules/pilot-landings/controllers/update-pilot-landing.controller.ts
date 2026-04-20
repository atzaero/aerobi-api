import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { UpdatePilotLandingDocs } from '../docs/update-pilot-landing.docs';
import { PilotLandingParamDTO } from '../dtos/pilot-landing-param.dto';
import { PilotLandingResponseDTO } from '../dtos/pilot-landing-response.dto';
import { UpdatePilotLandingDTO } from '../dtos/update-pilot-landing.dto';
import { UpdatePilotLandingService } from '../services/update-pilot-landing.service';

@ApiTags('Pilot Landings')
@Controller('pilot-landings')
@UseGuards(AerobiApiKeyGuard)
export class UpdatePilotLandingController {
  constructor(private readonly service: UpdatePilotLandingService) {}

  @Patch(':pilotLandingId')
  @UpdatePilotLandingDocs()
  handle(
    @Param() params: PilotLandingParamDTO,
    @Body() dto: UpdatePilotLandingDTO,
  ): Promise<PilotLandingResponseDTO> {
    return this.service.execute({ id: params.pilotLandingId, ...dto });
  }
}
