import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { ListAerodromeGeojsonsDocs } from '../docs/list-aerodrome-geojsons.docs';
import { ListAerodromeGeojsonsQueryDTO } from '../dtos/list-aerodrome-geojsons-query.dto';
import { AerodromeGeojsonsPaginatedResponseDTO } from '../dtos/aerodrome-geojsons-paginated-response.dto';
import { ListAerodromeGeojsonsService } from '../services/list-aerodrome-geojsons.service';

@ApiTags('Aerodrome Geojsons')
@Controller('aerodrome-geojsons')
@UseGuards(AerobiApiKeyGuard)
export class ListAerodromeGeojsonsController {
  constructor(private readonly service: ListAerodromeGeojsonsService) {}

  @Get()
  @ListAerodromeGeojsonsDocs()
  handle(
    @Query() query: ListAerodromeGeojsonsQueryDTO,
  ): Promise<AerodromeGeojsonsPaginatedResponseDTO> {
    return this.service.execute(query);
  }
}
