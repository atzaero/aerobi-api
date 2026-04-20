import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { FindAerodromeGeojsonByIdDocs } from '../docs/find-aerodrome-geojson-by-id.docs';
import { AerodromeGeojsonResponseDTO } from '../dtos/aerodrome-geojson-response.dto';
import { FindAerodromeGeojsonByIdService } from '../services/find-aerodrome-geojson-by-id.service';

@ApiTags('Aerodrome Geojsons')
@Controller('aerodrome-geojsons')
@UseGuards(AerobiApiKeyGuard)
export class FindAerodromeGeojsonByIdController {
  constructor(private readonly service: FindAerodromeGeojsonByIdService) {}

  @Get(':id')
  @FindAerodromeGeojsonByIdDocs()
  handle(@Param('id') id: string): Promise<AerodromeGeojsonResponseDTO> {
    return this.service.execute({ id });
  }
}
