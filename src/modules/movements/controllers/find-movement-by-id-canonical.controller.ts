import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { FindMovementByIdCanonicalDocs } from '../docs/find-movement-by-id-canonical.docs';
import { MovementIdParamDTO } from '../dtos/movement-id-param.dto';
import { MovementResponseDTO } from '../dtos/movement-response.dto';
import { FindMovementByIdService } from '../services/find-movement-by-id.service';

/**
 * Rota canônica `GET /movements/:movementId`. Reusa o `FindMovementByIdService`
 * — a rota legada `GET /readings/:readingId` continua como alias deprecado.
 */
@ApiTags('Movements')
@Controller('movements')
@UseGuards(AerobiApiKeyGuard)
export class FindMovementByIdCanonicalController {
  constructor(private readonly service: FindMovementByIdService) {}

  @Get(':movementId')
  @FindMovementByIdCanonicalDocs()
  handle(@Param() params: MovementIdParamDTO): Promise<MovementResponseDTO> {
    return this.service.execute(params.movementId);
  }
}
