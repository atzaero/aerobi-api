import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { ListAerodromesDocs } from '../docs/list-aerodromes.docs';
import { ListAerodromesQueryDTO } from '../dtos/list-aerodromes-query.dto';
import { AerodromesPaginatedResponseDTO } from '../dtos/aerodromes-paginated-response.dto';
import { ListAerodromesService } from '../services/list-aerodromes.service';

@ApiTags('Aerodromes')
@Controller('aerodromes')
@UseGuards(AerobiApiKeyGuard)
export class ListAerodromesController {
  constructor(private readonly service: ListAerodromesService) {}

  @Get()
  @ListAerodromesDocs()
  handle(
    @Query() query: ListAerodromesQueryDTO,
  ): Promise<AerodromesPaginatedResponseDTO> {
    return this.service.execute(query);
  }
}
