import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { UpdateMovementCanonicalDocs } from '../docs/update-movement-canonical.docs';
import { MovementIdParamDTO } from '../dtos/movement-id-param.dto';
import { MovementResponseDTO } from '../dtos/movement-response.dto';
import { UpdateMovementDTO } from '../dtos/update-movement.dto';
import { UpdateMovementService } from '../services/update-movement.service';

/**
 * Rota canônica `PATCH /movements/:movementId` — corrige a matrícula de um
 * movimento. JWT + RBAC `movement:update`; o `updatedBy` (auditoria) e o escopo
 * por grupo derivam do ator autenticado. Sem alias legado em `/readings`: a
 * edição é funcionalidade nova e o cliente aviascan-cv apenas cria movimentos.
 */
@ApiTags('Movements')
@Controller('movements')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UpdateMovementCanonicalController {
  constructor(private readonly service: UpdateMovementService) {}

  @Patch(':movementId')
  @RequirePermission('movement', 'update')
  @UpdateMovementCanonicalDocs()
  handle(
    @Param() params: MovementIdParamDTO,
    @Body() dto: UpdateMovementDTO,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<MovementResponseDTO> {
    return this.service.execute(
      { id: params.movementId, registration: dto.registration },
      actor,
    );
  }
}
