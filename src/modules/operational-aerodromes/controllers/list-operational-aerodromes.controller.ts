import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { ListOperationalAerodromesDocs } from '../docs/list-operational-aerodromes.docs';
import { ListOperationalAerodromesQueryDTO } from '../dtos/list-operational-aerodromes-query.dto';
import { OperationalAerodromesPaginatedResponseDTO } from '../dtos/operational-aerodromes-paginated-response.dto';
import { ListOperationalAerodromesService } from '../services/list-operational-aerodromes.service';

@ApiTags('Operational Aerodromes')
@Controller('operational-aerodromes')
@UseGuards(AerobiApiKeyGuard)
export class ListOperationalAerodromesController {
  constructor(private readonly service: ListOperationalAerodromesService) {}

  @Get()
  @ListOperationalAerodromesDocs()
  handle(
    @Query() query: ListOperationalAerodromesQueryDTO,
  ): Promise<OperationalAerodromesPaginatedResponseDTO> {
    return this.service.execute(query);
  }
}
