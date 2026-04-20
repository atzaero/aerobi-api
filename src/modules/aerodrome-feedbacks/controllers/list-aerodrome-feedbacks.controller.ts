import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { ListAerodromeFeedbacksDocs } from '../docs/list-aerodrome-feedbacks.docs';
import { ListAerodromeFeedbacksQueryDTO } from '../dtos/list-aerodrome-feedbacks-query.dto';
import { AerodromeFeedbacksPaginatedResponseDTO } from '../dtos/aerodrome-feedbacks-paginated-response.dto';
import { ListAerodromeFeedbacksService } from '../services/list-aerodrome-feedbacks.service';

@ApiTags('Aerodrome Feedbacks')
@Controller('aerodrome-feedbacks')
@UseGuards(AerobiApiKeyGuard)
export class ListAerodromeFeedbacksController {
  constructor(private readonly service: ListAerodromeFeedbacksService) {}

  @Get()
  @ListAerodromeFeedbacksDocs()
  handle(
    @Query() query: ListAerodromeFeedbacksQueryDTO,
  ): Promise<AerodromeFeedbacksPaginatedResponseDTO> {
    return this.service.execute(query);
  }
}
