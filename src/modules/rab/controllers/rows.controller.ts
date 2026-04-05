import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { RowsDocs } from '../docs/rows.docs';
import { RabRowsFindAllQueryDTO } from '../dtos/rab-rows-find-all-query.dto';
import { RabRowsPaginatedResponseDTO } from '../dtos/rab-rows-paginated-response.dto';
import { RabRowsService } from '../services/rab-rows.service';

@ApiTags('RAB')
@Controller('rab')
@UseGuards(AerobiApiKeyGuard)
export class RowsController {
  constructor(private readonly rabRows: RabRowsService) {}

  @Get('rows')
  @RowsDocs()
  handle(
    @Query() query: RabRowsFindAllQueryDTO,
  ): Promise<RabRowsPaginatedResponseDTO> {
    return this.rabRows.execute(query);
  }
}
