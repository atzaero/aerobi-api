import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';

import { FindAuditLogByIdDocs } from '../docs/find-audit-log-by-id.docs';
import { AuditLogIdParamDto } from '../dtos/audit-log-id-param.dto';
import { AuditLogResponseDto } from '../dtos/audit-log-response.dto';
import { FindAuditLogByIdService } from '../services/find-audit-log-by-id.service';

/**
 * Detalhe de um registro de auditoria. Gated por
 * `@RequirePermission('audit','read')` (ADMIN/COORDINATOR).
 */
@ApiTags('Audit')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FindAuditLogByIdController {
  constructor(private readonly service: FindAuditLogByIdService) {}

  @Get(':id')
  @RequirePermission('audit', 'read')
  @FindAuditLogByIdDocs()
  handle(@Param() { id }: AuditLogIdParamDto): Promise<AuditLogResponseDto> {
    return this.service.execute(id);
  }
}
