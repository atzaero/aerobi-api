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
