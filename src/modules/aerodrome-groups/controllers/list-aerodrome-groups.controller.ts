import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { ListAerodromeGroupsDocs } from '../docs/list-aerodrome-groups.docs';
import { ListAerodromeGroupsQueryDTO } from '../dtos/list-aerodrome-groups-query.dto';
import { AerodromeGroupsPaginatedResponseDTO } from '../dtos/aerodrome-groups-paginated-response.dto';
import { ListAerodromeGroupsService } from '../services/list-aerodrome-groups.service';

@ApiTags('Aerodrome Groups')
@Controller('aerodrome-groups')
@UseGuards(AerobiApiKeyGuard)
export class ListAerodromeGroupsController {
  constructor(private readonly service: ListAerodromeGroupsService) {}

  @Get()
  @ListAerodromeGroupsDocs()
  handle(
    @Query() query: ListAerodromeGroupsQueryDTO,
  ): Promise<AerodromeGroupsPaginatedResponseDTO> {
    return this.service.execute(query);
  }
}
