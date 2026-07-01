import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { CreateGeojsonDocs } from '../docs/create-geojson.docs';
import { GeojsonResponseDTO } from '../dtos/geojson-response.dto';
import { CreateGeojsonDTO } from '../dtos/create-geojson.dto';
import { CreateGeojsonService } from '../services/create-geojson.service';

@ApiTags('Geojsons')
@Controller('geojsons')
@UseGuards(AerobiApiKeyGuard)
export class CreateGeojsonController {
  constructor(private readonly service: CreateGeojsonService) {}

  @Post()
  @CreateGeojsonDocs()
  handle(@Body() dto: CreateGeojsonDTO): Promise<GeojsonResponseDTO> {
    return this.service.execute(dto);
  }
}
