import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { UpdateLandingRequestDocs } from '../docs/update-landing-request.docs';
import { LandingRequestResponseDTO } from '../dtos/landing-request-response.dto';
import { UpdateLandingRequestDTO } from '../dtos/update-landing-request.dto';
import { UpdateLandingRequestService } from '../services/update-landing-request.service';

@ApiTags('Landing Requests')
@Controller('landing-requests')
@UseGuards(AerobiApiKeyGuard)
export class UpdateLandingRequestController {
  constructor(private readonly service: UpdateLandingRequestService) {}

  @Patch(':id')
  @UpdateLandingRequestDocs()
  handle(
    @Param('id') id: string,
    @Body() dto: UpdateLandingRequestDTO,
  ): Promise<LandingRequestResponseDTO> {
    return this.service.execute({ id, ...dto });
  }
}
