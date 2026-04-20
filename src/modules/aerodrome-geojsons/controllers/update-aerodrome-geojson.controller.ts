import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { UpdateAerodromeGeojsonDocs } from '../docs/update-aerodrome-geojson.docs';
import { AerodromeGeojsonParamDTO } from '../dtos/aerodrome-geojson-param.dto';
import { AerodromeGeojsonResponseDTO } from '../dtos/aerodrome-geojson-response.dto';
import { UpdateAerodromeGeojsonDTO } from '../dtos/update-aerodrome-geojson.dto';
import { UpdateAerodromeGeojsonService } from '../services/update-aerodrome-geojson.service';

@ApiTags('Aerodrome Geojsons')
@Controller('aerodrome-geojsons')
@UseGuards(AerobiApiKeyGuard)
export class UpdateAerodromeGeojsonController {
  constructor(private readonly service: UpdateAerodromeGeojsonService) {}

  @Patch(':aerodromeGeojsonId')
  @UpdateAerodromeGeojsonDocs()
  handle(
    @Param() params: AerodromeGeojsonParamDTO,
    @Body() dto: UpdateAerodromeGeojsonDTO,
  ): Promise<AerodromeGeojsonResponseDTO> {
    return this.service.execute({ id: params.aerodromeGeojsonId, ...dto });
  }
}
