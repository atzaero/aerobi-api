import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { ListLandingRequestsDocs } from '../docs/list-landing-requests.docs';
import { ListLandingRequestsQueryDTO } from '../dtos/list-landing-requests-query.dto';
import { LandingRequestsPaginatedResponseDTO } from '../dtos/landing-requests-paginated-response.dto';
import { ListLandingRequestsService } from '../services/list-landing-requests.service';

@ApiTags('Landing Requests')
@Controller('landing-requests')
@UseGuards(AerobiApiKeyGuard)
export class ListLandingRequestsController {
  constructor(private readonly service: ListLandingRequestsService) {}

  @Get()
  @ListLandingRequestsDocs()
  handle(
    @Query() query: ListLandingRequestsQueryDTO,
  ): Promise<LandingRequestsPaginatedResponseDTO> {
    return this.service.execute(query);
  }
}
