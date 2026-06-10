import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { ListMovementsCanonicalDocs } from '../docs/list-movements-canonical.docs';
import { MovementsPaginatedResponseDTO } from '../dtos/movements-paginated-response.dto';
import { ListMovementsQueryDTO } from '../dtos/list-movements-query.dto';
import { ListMovementsService } from '../services/list-movements.service';

/**
 * Rota canônica `GET /movements` (paginada). Reusa o `ListMovementsService` — a
 * rota legada `GET /readings` continua como alias deprecado.
 */
@ApiTags('Movements')
@Controller('movements')
@UseGuards(AerobiApiKeyGuard)
export class ListMovementsCanonicalController {
  constructor(private readonly service: ListMovementsService) {}

  @Get()
  @ListMovementsCanonicalDocs()
  handle(
    @Query() query: ListMovementsQueryDTO,
  ): Promise<MovementsPaginatedResponseDTO> {
    return this.service.execute(query);
  }
}
