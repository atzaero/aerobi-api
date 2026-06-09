import { Controller, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { ListUsersDocs } from '../docs/list-users.docs';
import { ListUsersQueryDto } from '../dtos/list-users-query.dto';
import { UsersPaginatedResponseDto } from '../dtos/users-paginated-response.dto';
import { ListUsersService } from '../services/list-users.service';

/**
 * Listagem de usuários. Gated por `@RequirePermission('user','list')`
 * (ADMIN/COORDINATOR). O **escopo por grupo** é aplicado no service: COORDINATOR
 * só enxerga o **próprio grupo** (`aerodromeGroupId` resolvido por consulta);
 * ADMIN vê todos. Espelha `aerobi-web` `app/actions/users/list`.
 */
@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ListUsersController {
  constructor(private readonly service: ListUsersService) {}

  @ListUsersDocs()
  @RequirePermission('user', 'list')
  handle(
    @Query() query: ListUsersQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<UsersPaginatedResponseDto> {
    return this.service.execute(query, actor);
  }
}
