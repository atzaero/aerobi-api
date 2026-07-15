import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';

import { ListAuditLogsDocs } from '../docs/list-audit-logs.docs';
import { AuditLogsPaginatedResponseDto } from '../dtos/audit-logs-paginated-response.dto';
import { ListAuditLogsQueryDto } from '../dtos/list-audit-logs-query.dto';
import { ListAuditLogsService } from '../services/list-audit-logs.service';

/**
 * Listagem de auditoria. Gated por `@RequirePermission('audit','list')`
 * (ADMIN/COORDINATOR). Sem escopo de grupo (paridade com o aerobi-web).
 */
@ApiTags('Audit')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ListAuditLogsController {
  constructor(private readonly service: ListAuditLogsService) {}

  @Get()
  @RequirePermission('audit', 'list')
  @ListAuditLogsDocs()
  handle(
    @Query() query: ListAuditLogsQueryDto,
  ): Promise<AuditLogsPaginatedResponseDto> {
    return this.service.execute(query);
  }
}
