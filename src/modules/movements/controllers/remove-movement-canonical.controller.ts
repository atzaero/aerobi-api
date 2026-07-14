import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { RemoveMovementCanonicalDocs } from '../docs/remove-movement-canonical.docs';
import { MovementIdParamDTO } from '../dtos/movement-id-param.dto';
import { MovementResponseDTO } from '../dtos/movement-response.dto';
import { RemoveMovementService } from '../services/remove-movement.service';

/**
 * Rota canônica `DELETE /movements/:movementId` (soft delete). JWT + RBAC
 * `movement:delete`; o `deletedBy` (auditoria) e o escopo por grupo derivam do
 * ator autenticado.
 */
@ApiTags('Movements')
@Controller('movements')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RemoveMovementCanonicalController {
  constructor(private readonly service: RemoveMovementService) {}

  @Delete(':movementId')
  @RequirePermission('movement', 'delete')
  @RemoveMovementCanonicalDocs()
  handle(
    @Param() params: MovementIdParamDTO,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<MovementResponseDTO> {
    return this.service.execute({ id: params.movementId }, actor);
  }
}
