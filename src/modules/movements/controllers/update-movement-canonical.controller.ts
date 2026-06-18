import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { UpdateMovementCanonicalDocs } from '../docs/update-movement-canonical.docs';
import { MovementIdParamDTO } from '../dtos/movement-id-param.dto';
import { MovementResponseDTO } from '../dtos/movement-response.dto';
import { UpdateMovementDTO } from '../dtos/update-movement.dto';
import { UpdateMovementService } from '../services/update-movement.service';

/**
 * Rota canônica `PATCH /movements/:movementId` — corrige a matrícula de um
 * movimento. Sem alias legado em `/readings`: a edição é funcionalidade nova e
 * o cliente legado (aviascan-cv) apenas cria movimentos.
 */
@ApiTags('Movements')
@Controller('movements')
@UseGuards(AerobiApiKeyGuard)
export class UpdateMovementCanonicalController {
  constructor(private readonly service: UpdateMovementService) {}

  @Patch(':movementId')
  @UpdateMovementCanonicalDocs()
  handle(
    @Param() params: MovementIdParamDTO,
    @Body() dto: UpdateMovementDTO,
  ): Promise<MovementResponseDTO> {
    /** TODO: obter updatedBy do contexto autenticado quando houver auth de usuário. */
    return this.service.execute({
      id: params.movementId,
      registration: dto.registration,
      updatedBy: 'system',
    });
  }
}
