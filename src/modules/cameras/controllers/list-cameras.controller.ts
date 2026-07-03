import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { ListCamerasDocs } from '../docs/list-cameras.docs';
import { CamerasPaginatedResponseDTO } from '../dtos/cameras-paginated-response.dto';
import { ListCamerasQueryDTO } from '../dtos/list-cameras-query.dto';
import { ListCamerasService } from '../services/list-cameras.service';

@ApiTags('Cameras')
@Controller('cameras')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ListCamerasController {
  constructor(private readonly service: ListCamerasService) {}

  @Get()
  @RequirePermission('camera', 'list')
  @ListCamerasDocs()
  handle(
    @Query() query: ListCamerasQueryDTO,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<CamerasPaginatedResponseDTO> {
    return this.service.execute(query, actor);
  }
}
