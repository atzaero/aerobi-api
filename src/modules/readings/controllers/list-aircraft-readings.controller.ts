import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { ListAircraftReadingsDocs } from '../docs/list-aircraft-readings.docs';
import { AircraftReadingsPaginatedResponseDTO } from '../dtos/aircraft-readings-paginated-response.dto';
import { ListAircraftReadingsQueryDTO } from '../dtos/list-aircraft-readings-query.dto';
import { ListAircraftReadingsService } from '../services/list-aircraft-readings.service';

@ApiTags('Readings')
@Controller('readings')
@UseGuards(AerobiApiKeyGuard)
export class ListAircraftReadingsController {
  constructor(private readonly service: ListAircraftReadingsService) {}

  @Get()
  @ListAircraftReadingsDocs()
  handle(
    @Query() query: ListAircraftReadingsQueryDTO,
  ): Promise<AircraftReadingsPaginatedResponseDTO> {
    return this.service.execute(query);
  }
}
