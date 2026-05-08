import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { CreateAerodromeGeojsonDocs } from '../docs/create-aerodrome-geojson.docs';
import { AerodromeGeojsonResponseDTO } from '../dtos/aerodrome-geojson-response.dto';
import { CreateAerodromeGeojsonDTO } from '../dtos/create-aerodrome-geojson.dto';
import { CreateAerodromeGeojsonService } from '../services/create-aerodrome-geojson.service';

@ApiTags('Aerodrome Geojsons')
@Controller('aerodrome-geojsons')
@UseGuards(AerobiApiKeyGuard)
export class CreateAerodromeGeojsonController {
  constructor(private readonly service: CreateAerodromeGeojsonService) {}

  @Post()
  @CreateAerodromeGeojsonDocs()
  handle(
    @Body() dto: CreateAerodromeGeojsonDTO,
  ): Promise<AerodromeGeojsonResponseDTO> {
    return this.service.execute(dto);
  }
}
