import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { ListAerodromesDocs } from '../docs/list-aerodromes.docs';
import { ListAerodromesQueryDTO } from '../dtos/list-aerodromes-query.dto';
import { AerodromesPaginatedResponseDTO } from '../dtos/aerodromes-paginated-response.dto';
import { ListAerodromesService } from '../services/list-aerodromes.service';

@ApiTags('Aerodromes')
@Controller('aerodromes')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ListAerodromesController {
  constructor(private readonly service: ListAerodromesService) {}

  @Get()
  @RequirePermission('aerodrome', 'list')
  @ListAerodromesDocs()
  handle(
    @Query() query: ListAerodromesQueryDTO,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<AerodromesPaginatedResponseDTO> {
    return this.service.execute(query, actor);
  }
}
