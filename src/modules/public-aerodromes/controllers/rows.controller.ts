import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { PublicAerodromesDataDocs } from '../docs/rows.docs';
import { PublicAerodromesFindAllQueryDTO } from '../dtos/public-aerodromes-find-all-query.dto';
import { PublicAerodromesPaginatedResponseDTO } from '../dtos/public-aerodromes-paginated-response.dto';
import { PublicAerodromesRowsService } from '../services/public-aerodromes-rows.service';

@ApiTags('Public Aerodromes')
@Controller('public-aerodromes')
@UseGuards(AerobiApiKeyGuard)
export class PublicAerodromesRowsController {
  constructor(private readonly rows: PublicAerodromesRowsService) {}

  @Get()
  @PublicAerodromesDataDocs()
  handle(
    @Query() query: PublicAerodromesFindAllQueryDTO,
  ): Promise<PublicAerodromesPaginatedResponseDTO> {
    return this.rows.execute(query);
  }
}
