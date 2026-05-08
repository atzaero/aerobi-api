import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { CreateLandingRequestDocs } from '../docs/create-landing-request.docs';
import { LandingRequestResponseDTO } from '../dtos/landing-request-response.dto';
import { CreateLandingRequestDTO } from '../dtos/create-landing-request.dto';
import { CreateLandingRequestService } from '../services/create-landing-request.service';

@ApiTags('Landing Requests')
@Controller('landing-requests')
@UseGuards(AerobiApiKeyGuard)
export class CreateLandingRequestController {
  constructor(private readonly service: CreateLandingRequestService) {}

  @Post()
  @CreateLandingRequestDocs()
  handle(
    @Body() dto: CreateLandingRequestDTO,
  ): Promise<LandingRequestResponseDTO> {
    return this.service.execute(dto);
  }
}
