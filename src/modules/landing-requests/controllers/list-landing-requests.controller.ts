import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { ListLandingRequestsDocs } from '../docs/list-landing-requests.docs';
import { LandingRequestsPaginatedResponseDTO } from '../dtos/landing-requests-paginated-response.dto';
import { ListLandingRequestsQueryDTO } from '../dtos/list-landing-requests-query.dto';
import { ListLandingRequestsService } from '../services/list-landing-requests.service';

@ApiTags('Landing Requests')
@Controller('landing-requests')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ListLandingRequestsController {
  constructor(private readonly service: ListLandingRequestsService) {}

  @Get()
  @RequirePermission('landing_request', 'list')
  @ListLandingRequestsDocs()
  handle(
    @Query() query: ListLandingRequestsQueryDTO,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<LandingRequestsPaginatedResponseDTO> {
    return this.service.execute(query, actor);
  }
}
