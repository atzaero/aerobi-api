import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { ListTechnicalVisitsDocs } from '../docs/list-technical-visits.docs';
import { ListTechnicalVisitsQueryDTO } from '../dtos/list-technical-visits-query.dto';
import { TechnicalVisitsPaginatedResponseDTO } from '../dtos/technical-visits-paginated-response.dto';
import { ListTechnicalVisitsService } from '../services/list-technical-visits.service';

@ApiTags('Technical Visits')
@Controller('technical-visits')
@UseGuards(AerobiApiKeyGuard)
export class ListTechnicalVisitsController {
  constructor(private readonly service: ListTechnicalVisitsService) {}

  @Get()
  @ListTechnicalVisitsDocs()
  handle(
    @Query() query: ListTechnicalVisitsQueryDTO,
  ): Promise<TechnicalVisitsPaginatedResponseDTO> {
    return this.service.execute(query);
  }
}
