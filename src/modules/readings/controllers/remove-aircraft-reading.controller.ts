import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { RemoveAircraftReadingDocs } from '../docs/remove-aircraft-reading.docs';
import { AircraftReadingParamDTO } from '../dtos/aircraft-reading-param.dto';
import { AircraftReadingResponseDTO } from '../dtos/aircraft-reading-response.dto';
import { RemoveAircraftReadingService } from '../services/remove-aircraft-reading.service';

@ApiTags('Readings')
@Controller('readings')
@UseGuards(AerobiApiKeyGuard)
export class RemoveAircraftReadingController {
  constructor(private readonly service: RemoveAircraftReadingService) {}

  @Delete(':readingId')
  @RemoveAircraftReadingDocs()
  handle(
    @Param() params: AircraftReadingParamDTO,
  ): Promise<AircraftReadingResponseDTO> {
    // TODO: obter deletedBy do contexto autenticado quando houver auth de usuário.
    return this.service.execute({
      id: params.readingId,
      deletedBy: 'system',
    });
  }
}
