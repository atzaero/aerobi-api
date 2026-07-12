import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { FindVisibleGeojsonByAerodromeIdDocs } from '../docs/find-visible-geojson-by-aerodrome-id.docs';
import { GeojsonAerodromeIdParamDTO } from '../dtos/geojson-aerodrome-id-param.dto';
import { GeojsonForAerodromeResponseDTO } from '../dtos/geojson-for-aerodrome-response.dto';
import { FindVisibleGeojsonByAerodromeIdService } from '../services/find-visible-geojson-by-aerodrome-id.service';

/**
 * `GET /geojsons/visible/:aerodromeId` — layer público (X-API-Key). Sem JWT/RBAC.
 * Precedência sobre `/:id`: ver `geojsons.module.ts` / `.spec.ts`.
 */
@ApiTags('Geojsons')
@Controller('geojsons')
@UseGuards(AerobiApiKeyGuard)
export class FindVisibleGeojsonByAerodromeIdController {
  constructor(
    private readonly service: FindVisibleGeojsonByAerodromeIdService,
  ) {}

  @Get('visible/:aerodromeId')
  @FindVisibleGeojsonByAerodromeIdDocs()
  handle(
    @Param() params: GeojsonAerodromeIdParamDTO,
  ): Promise<GeojsonForAerodromeResponseDTO> {
    return this.service.execute({ aerodromeId: params.aerodromeId });
  }
}
