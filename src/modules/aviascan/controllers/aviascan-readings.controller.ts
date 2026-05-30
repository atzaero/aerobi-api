import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { AviascanReadingsDocs } from '../docs/aviascan-readings.docs';
import { AviascanReadingsQueryDto } from '../dtos/aviascan-readings-query.dto';
import { AviascanReadingsService } from '../services/aviascan-readings.service';
import type { AviascanReadingsPaginatedResponse } from '../types/aviascan.types';

@ApiTags('AviaScan')
@Controller('aviascan')
@UseGuards(AerobiApiKeyGuard)
export class AviascanReadingsController {
  constructor(private readonly aviascanReadings: AviascanReadingsService) {}

  @Get('readings/paginated')
  @AviascanReadingsDocs()
  async handle(
    @Query() query: AviascanReadingsQueryDto,
  ): Promise<AviascanReadingsPaginatedResponse> {
    return this.aviascanReadings.execute({
      page: query.page,
      limit: query.limit,
      registration: query.registration,
      aerodrome: query.aerodrome,
      start_date: query.start_date,
      end_date: query.end_date,
    });
  }
}
