import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';

import { RowsDocs } from '../docs/rows.docs';
import { RabRowsFindAllQueryDTO } from '../dtos/rab-rows-find-all-query.dto';
import { RabRowsPaginatedResponseDTO } from '../dtos/rab-rows-paginated-response.dto';
import { RabRowsService } from '../services/rab-rows.service';

/**
 * `GET /rab/rows` — JWT + RBAC `rab:read`. Sem escopo por grupo (RAB é dado
 * aberto nacional da ANAC).
 */
@ApiTags('RAB')
@Controller('rab')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RowsController {
  constructor(private readonly rabRows: RabRowsService) {}

  @Get('rows')
  @RequirePermission('rab', 'read')
  @RowsDocs()
  handle(
    @Query() query: RabRowsFindAllQueryDTO,
  ): Promise<RabRowsPaginatedResponseDTO> {
    return this.rabRows.execute(query);
  }
}
