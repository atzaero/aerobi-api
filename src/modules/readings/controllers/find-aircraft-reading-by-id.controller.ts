import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { FindAircraftReadingByIdDocs } from '../docs/find-aircraft-reading-by-id.docs';
import { AircraftReadingParamDTO } from '../dtos/aircraft-reading-param.dto';
import { AircraftReadingResponseDTO } from '../dtos/aircraft-reading-response.dto';
import { FindAircraftReadingByIdService } from '../services/find-aircraft-reading-by-id.service';

@ApiTags('Readings')
@Controller('readings')
@UseGuards(AerobiApiKeyGuard)
export class FindAircraftReadingByIdController {
  constructor(private readonly service: FindAircraftReadingByIdService) {}

  @Get(':readingId')
  @FindAircraftReadingByIdDocs()
  handle(
    @Param() params: AircraftReadingParamDTO,
  ): Promise<AircraftReadingResponseDTO> {
    return this.service.execute(params.readingId);
  }
}
