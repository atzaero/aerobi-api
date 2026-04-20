import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { ListPilotLandingsDocs } from '../docs/list-pilot-landings.docs';
import { ListPilotLandingsQueryDTO } from '../dtos/list-pilot-landings-query.dto';
import { PilotLandingsPaginatedResponseDTO } from '../dtos/pilot-landings-paginated-response.dto';
import { ListPilotLandingsService } from '../services/list-pilot-landings.service';

@ApiTags('Pilot Landings')
@Controller('pilot-landings')
@UseGuards(AerobiApiKeyGuard)
export class ListPilotLandingsController {
  constructor(private readonly service: ListPilotLandingsService) {}

  @Get()
  @ListPilotLandingsDocs()
  handle(
    @Query() query: ListPilotLandingsQueryDTO,
  ): Promise<PilotLandingsPaginatedResponseDTO> {
    return this.service.execute(query);
  }
}
