import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { RemoveMovementCanonicalDocs } from '../docs/remove-movement-canonical.docs';
import { MovementIdParamDTO } from '../dtos/movement-id-param.dto';
import { MovementResponseDTO } from '../dtos/movement-response.dto';
import { RemoveMovementService } from '../services/remove-movement.service';

/**
 * Rota canônica `DELETE /movements/:movementId` (soft delete). Reusa o
 * `RemoveMovementService` — a rota legada `DELETE /readings/:readingId` continua
 * como alias deprecado.
 */
@ApiTags('Movements')
@Controller('movements')
@UseGuards(AerobiApiKeyGuard)
export class RemoveMovementCanonicalController {
  constructor(private readonly service: RemoveMovementService) {}

  @Delete(':movementId')
  @RemoveMovementCanonicalDocs()
  handle(@Param() params: MovementIdParamDTO): Promise<MovementResponseDTO> {
    // TODO: obter deletedBy do contexto autenticado quando houver auth de usuário.
    return this.service.execute({
      id: params.movementId,
      deletedBy: 'system',
    });
  }
}
