import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { RemoveGeojsonDocs } from '../docs/remove-geojson.docs';
import { GeojsonParamDTO } from '../dtos/geojson-param.dto';
import { GeojsonResponseDTO } from '../dtos/geojson-response.dto';
import { RemoveGeojsonService } from '../services/remove-geojson.service';

@ApiTags('Geojsons')
@Controller('geojsons')
@UseGuards(AerobiApiKeyGuard)
export class RemoveGeojsonController {
  constructor(private readonly service: RemoveGeojsonService) {}

  @Delete(':geojsonId')
  @RemoveGeojsonDocs()
  handle(@Param() params: GeojsonParamDTO): Promise<GeojsonResponseDTO> {
    // TODO: obter deletedBy do contexto autenticado
    return this.service.execute({
      id: params.geojsonId,
      deletedBy: 'system',
    });
  }
}
