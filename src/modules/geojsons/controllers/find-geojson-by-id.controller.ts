import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { FindGeojsonByIdDocs } from '../docs/find-geojson-by-id.docs';
import { GeojsonParamDTO } from '../dtos/geojson-param.dto';
import { GeojsonResponseDTO } from '../dtos/geojson-response.dto';
import { FindGeojsonByIdService } from '../services/find-geojson-by-id.service';

@ApiTags('Geojsons')
@Controller('geojsons')
@UseGuards(AerobiApiKeyGuard)
export class FindGeojsonByIdController {
  constructor(private readonly service: FindGeojsonByIdService) {}

  @Get(':geojsonId')
  @FindGeojsonByIdDocs()
  handle(@Param() params: GeojsonParamDTO): Promise<GeojsonResponseDTO> {
    return this.service.execute({ id: params.geojsonId });
  }
}
