import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { ListVisibleGeojsonsDocs } from '../docs/list-visible-geojsons.docs';
import { GeojsonForAerodromeResponseDTO } from '../dtos/geojson-for-aerodrome-response.dto';
import { ListVisibleGeojsonsService } from '../services/list-visible-geojsons.service';

/**
 * `GET /geojsons/visible` — layers do mapa público (X-API-Key). Sem JWT/RBAC.
 * Precedência sobre `/:id`: ver `geojsons.module.ts` / `.spec.ts`.
 */
@ApiTags('Geojsons')
@Controller('geojsons')
@UseGuards(AerobiApiKeyGuard)
export class ListVisibleGeojsonsController {
  constructor(private readonly service: ListVisibleGeojsonsService) {}

  @Get('visible')
  @ListVisibleGeojsonsDocs()
  handle(): Promise<GeojsonForAerodromeResponseDTO[]> {
    return this.service.execute();
  }
}
