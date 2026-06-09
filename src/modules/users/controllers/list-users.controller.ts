import { Controller, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { UserRole } from '@/generated/prisma/client';

import { ListUsersDocs } from '../docs/list-users.docs';
import { ListUsersQueryDto } from '../dtos/list-users-query.dto';
import { UsersPaginatedResponseDto } from '../dtos/users-paginated-response.dto';
import { ListUsersService } from '../services/list-users.service';

/**
 * Listagem de usuários. Mantida **ADMIN-only** (`@Roles`) — diferente da matriz
 * (`user:list` = ADMIN/COORDINATOR) — de propósito: o `aerobi-web` restringe o
 * COORDINATOR ao **próprio grupo**, e o escopo por grupo (`aerodromeGroupId` no
 * token/`User`) só chega na epic #204. Ampliar para COORDINATOR aqui exporia
 * **todos** os usuários (incl. ADMINs de todos os grupos) — mais que o front.
 * Migra para `@RequirePermission('user','list')` + filtro de grupo junto da #204.
 */
@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ListUsersController {
  constructor(private readonly service: ListUsersService) {}

  @ListUsersDocs()
  @Roles(UserRole.ADMIN)
  handle(
    @Query() query: ListUsersQueryDto,
  ): Promise<UsersPaginatedResponseDto> {
    return this.service.execute(query);
  }
}
