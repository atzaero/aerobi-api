import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { PrivateAerodromesDataDocs } from '../docs/rows.docs';
import { PrivateAerodromesFindAllQueryDTO } from '../dtos/private-aerodromes-find-all-query.dto';
import { PrivateAerodromesPaginatedResponseDTO } from '../dtos/private-aerodromes-paginated-response.dto';
import { PrivateAerodromesRowsService } from '../services/private-aerodromes-rows.service';

@ApiTags('Private Aerodromes')
@Controller('private-aerodromes')
@UseGuards(AerobiApiKeyGuard)
export class PrivateAerodromesRowsController {
  constructor(private readonly rows: PrivateAerodromesRowsService) {}

  @Get('data')
  @PrivateAerodromesDataDocs()
  handle(
    @Query() query: PrivateAerodromesFindAllQueryDTO,
  ): Promise<PrivateAerodromesPaginatedResponseDTO> {
    return this.rows.execute(query);
  }
}
