import { Controller, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';

import { ListUsersDocs } from '../docs/list-users.docs';
import { ListUsersQueryDto } from '../dtos/list-users-query.dto';
import { UsersPaginatedResponseDto } from '../dtos/users-paginated-response.dto';
import { ListUsersService } from '../services/list-users.service';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ListUsersController {
  constructor(private readonly service: ListUsersService) {}

  @ListUsersDocs()
  @RequirePermission('user', 'list')
  handle(
    @Query() query: ListUsersQueryDto,
  ): Promise<UsersPaginatedResponseDto> {
    return this.service.execute(query);
  }
}
