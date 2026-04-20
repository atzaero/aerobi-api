import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { FindLandingRequestByIdDocs } from '../docs/find-landing-request-by-id.docs';
import { LandingRequestParamDTO } from '../dtos/landing-request-param.dto';
import { LandingRequestResponseDTO } from '../dtos/landing-request-response.dto';
import { FindLandingRequestByIdService } from '../services/find-landing-request-by-id.service';

@ApiTags('Landing Requests')
@Controller('landing-requests')
@UseGuards(AerobiApiKeyGuard)
export class FindLandingRequestByIdController {
  constructor(private readonly service: FindLandingRequestByIdService) {}

  @Get(':landingRequestId')
  @FindLandingRequestByIdDocs()
  handle(
    @Param() params: LandingRequestParamDTO,
  ): Promise<LandingRequestResponseDTO> {
    return this.service.execute({ id: params.landingRequestId });
  }
}
