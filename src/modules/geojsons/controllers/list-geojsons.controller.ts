import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { ListGeojsonsDocs } from '../docs/list-geojsons.docs';
import { ListGeojsonsQueryDTO } from '../dtos/list-geojsons-query.dto';
import { GeojsonsPaginatedResponseDTO } from '../dtos/geojsons-paginated-response.dto';
import { ListGeojsonsService } from '../services/list-geojsons.service';

@ApiTags('Geojsons')
@Controller('geojsons')
@UseGuards(AerobiApiKeyGuard)
export class ListGeojsonsController {
  constructor(private readonly service: ListGeojsonsService) {}

  @Get()
  @ListGeojsonsDocs()
  handle(
    @Query() query: ListGeojsonsQueryDTO,
  ): Promise<GeojsonsPaginatedResponseDTO> {
    return this.service.execute(query);
  }
}
