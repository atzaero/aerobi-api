import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { FindMovementByIdCanonicalDocs } from '../docs/find-movement-by-id-canonical.docs';
import { MovementIdParamDTO } from '../dtos/movement-id-param.dto';
import { MovementResponseDTO } from '../dtos/movement-response.dto';
import { FindMovementByIdService } from '../services/find-movement-by-id.service';

/**
 * Rota canônica `GET /movements/:movementId`. JWT + RBAC `movement:read`; o
 * escopo por grupo é validado no service (404 uniforme quando o movimento não
 * pertence ao grupo do ator).
 */
@ApiTags('Movements')
@Controller('movements')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FindMovementByIdCanonicalController {
  constructor(private readonly service: FindMovementByIdService) {}

  @Get(':movementId')
  @RequirePermission('movement', 'read')
  @FindMovementByIdCanonicalDocs()
  handle(
    @Param() params: MovementIdParamDTO,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<MovementResponseDTO> {
    return this.service.execute(params.movementId, actor);
  }
}
