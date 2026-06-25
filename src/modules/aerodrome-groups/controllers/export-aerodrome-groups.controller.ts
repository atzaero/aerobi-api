import { Controller, Get, Header, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { ExportAerodromeGroupsDocs } from '../docs/export-aerodrome-groups.docs';
import { ExportAerodromeGroupsQueryDTO } from '../dtos/export-aerodrome-groups-query.dto';
import { ExportAerodromeGroupsService } from '../services/export-aerodrome-groups.service';

/**
 * `GET /aerodrome-groups/export`. Deve ser registrado **antes** do
 * `FindAerodromeGroupByIdController` no módulo, senão a rota cai no handler de
 * `:id` (e `export` falha a validação de UUID).
 */
@ApiTags('Aerodrome Groups')
@Controller('aerodrome-groups')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ExportAerodromeGroupsController {
  constructor(private readonly service: ExportAerodromeGroupsService) {}

  @Get('export')
  @RequirePermission('group', 'export')
  @ExportAerodromeGroupsDocs()
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="aerodrome-groups.csv"')
  handle(
    @Query() query: ExportAerodromeGroupsQueryDTO,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<string> {
    return this.service.execute(query, actor);
  }
}
