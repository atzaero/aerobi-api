import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { ListMovementsDocs } from '../docs/list-movements.docs';
import { MovementsPaginatedResponseDTO } from '../dtos/movements-paginated-response.dto';
import { ListMovementsQueryDTO } from '../dtos/list-movements-query.dto';
import { ListMovementsService } from '../services/list-movements.service';

@ApiTags('Readings')
@Controller('readings')
@UseGuards(AerobiApiKeyGuard)
export class ListMovementsController {
  constructor(private readonly service: ListMovementsService) {}

  @Get()
  @ListMovementsDocs()
  handle(
    @Query() query: ListMovementsQueryDTO,
  ): Promise<MovementsPaginatedResponseDTO> {
    return this.service.execute(query);
  }
}
