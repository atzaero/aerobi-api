import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { ListMovementsCanonicalDocs } from '../docs/list-movements-canonical.docs';
import { MovementsPaginatedResponseDTO } from '../dtos/movements-paginated-response.dto';
import { ListMovementsQueryDTO } from '../dtos/list-movements-query.dto';
import { ListMovementsService } from '../services/list-movements.service';

/**
 * Rota canônica `GET /movements` (paginada). Recurso gerido por usuário
 * autenticado (JWT + RBAC `movement:list`); o escopo por grupo (coordinator só o
 * próprio grupo) é resolvido no service pelos ICAOs do grupo do ator.
 */
@ApiTags('Movements')
@Controller('movements')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ListMovementsCanonicalController {
  constructor(private readonly service: ListMovementsService) {}

  @Get()
  @RequirePermission('movement', 'list')
  @ListMovementsCanonicalDocs()
  handle(
    @Query() query: ListMovementsQueryDTO,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<MovementsPaginatedResponseDTO> {
    return this.service.execute(query, actor);
  }
}
