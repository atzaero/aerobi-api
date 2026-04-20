import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { RemoveAerodromeGeojsonDocs } from '../docs/remove-aerodrome-geojson.docs';
import { AerodromeGeojsonResponseDTO } from '../dtos/aerodrome-geojson-response.dto';
import { RemoveAerodromeGeojsonService } from '../services/remove-aerodrome-geojson.service';

@ApiTags('Aerodrome Geojsons')
@Controller('aerodrome-geojsons')
@UseGuards(AerobiApiKeyGuard)
export class RemoveAerodromeGeojsonController {
  constructor(private readonly service: RemoveAerodromeGeojsonService) {}

  @Delete(':id')
  @RemoveAerodromeGeojsonDocs()
  handle(@Param('id') id: string): Promise<AerodromeGeojsonResponseDTO> {
    // TODO: obter deletedBy do contexto autenticado
    return this.service.execute({ id, deletedBy: 'system' });
  }
}
