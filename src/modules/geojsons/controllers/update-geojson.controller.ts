import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { UpdateGeojsonDocs } from '../docs/update-geojson.docs';
import { GeojsonParamDTO } from '../dtos/geojson-param.dto';
import { GeojsonResponseDTO } from '../dtos/geojson-response.dto';
import { UpdateGeojsonDTO } from '../dtos/update-geojson.dto';
import { UpdateGeojsonService } from '../services/update-geojson.service';

@ApiTags('Geojsons')
@Controller('geojsons')
@UseGuards(AerobiApiKeyGuard)
export class UpdateGeojsonController {
  constructor(private readonly service: UpdateGeojsonService) {}

  @Patch(':geojsonId')
  @UpdateGeojsonDocs()
  handle(
    @Param() params: GeojsonParamDTO,
    @Body() dto: UpdateGeojsonDTO,
  ): Promise<GeojsonResponseDTO> {
    return this.service.execute({ id: params.geojsonId, ...dto });
  }
}
