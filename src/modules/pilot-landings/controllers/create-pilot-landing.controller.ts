import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { CreatePilotLandingDocs } from '../docs/create-pilot-landing.docs';
import { PilotLandingResponseDTO } from '../dtos/pilot-landing-response.dto';
import { CreatePilotLandingDTO } from '../dtos/create-pilot-landing.dto';
import { CreatePilotLandingService } from '../services/create-pilot-landing.service';

@ApiTags('Pilot Landings')
@Controller('pilot-landings')
@UseGuards(AerobiApiKeyGuard)
export class CreatePilotLandingController {
  constructor(private readonly service: CreatePilotLandingService) {}

  @Post()
  @CreatePilotLandingDocs()
  handle(@Body() dto: CreatePilotLandingDTO): Promise<PilotLandingResponseDTO> {
    return this.service.execute(dto);
  }
}
