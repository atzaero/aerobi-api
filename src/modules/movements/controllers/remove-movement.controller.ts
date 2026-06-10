import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { RemoveMovementDocs } from '../docs/remove-movement.docs';
import { MovementParamDTO } from '../dtos/movement-param.dto';
import { MovementResponseDTO } from '../dtos/movement-response.dto';
import { RemoveMovementService } from '../services/remove-movement.service';

@ApiTags('Readings')
@Controller('readings')
@UseGuards(AerobiApiKeyGuard)
export class RemoveMovementController {
  constructor(private readonly service: RemoveMovementService) {}

  @Delete(':readingId')
  @RemoveMovementDocs()
  handle(@Param() params: MovementParamDTO): Promise<MovementResponseDTO> {
    // TODO: obter deletedBy do contexto autenticado quando houver auth de usuário.
    return this.service.execute({
      id: params.readingId,
      deletedBy: 'system',
    });
  }
}
