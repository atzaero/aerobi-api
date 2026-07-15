import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { ListGeojsonsDocs } from '../docs/list-geojsons.docs';
import { ListGeojsonsQueryDTO } from '../dtos/list-geojsons-query.dto';
import { GeojsonsPaginatedResponseDTO } from '../dtos/geojsons-paginated-response.dto';
import { ListGeojsonsService } from '../services/list-geojsons.service';

@ApiTags('Geojsons')
@Controller('geojsons')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ListGeojsonsController {
  constructor(private readonly service: ListGeojsonsService) {}

  @Get()
  @RequirePermission('aerodrome', 'list')
  @ListGeojsonsDocs()
  handle(
    @Query() query: ListGeojsonsQueryDTO,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<GeojsonsPaginatedResponseDTO> {
    return this.service.execute(query, actor);
  }
}
