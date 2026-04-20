import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { FindLandingRequestByIdDocs } from '../docs/find-landing-request-by-id.docs';
import { LandingRequestResponseDTO } from '../dtos/landing-request-response.dto';
import { FindLandingRequestByIdService } from '../services/find-landing-request-by-id.service';

@ApiTags('Landing Requests')
@Controller('landing-requests')
@UseGuards(AerobiApiKeyGuard)
export class FindLandingRequestByIdController {
  constructor(private readonly service: FindLandingRequestByIdService) {}

  @Get(':id')
  @FindLandingRequestByIdDocs()
  handle(@Param('id') id: string): Promise<LandingRequestResponseDTO> {
    return this.service.execute({ id });
  }
}
