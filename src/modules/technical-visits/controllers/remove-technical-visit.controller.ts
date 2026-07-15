import { Controller, Delete, Param, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { buildAuditContext } from '@/modules/audit/utils/audit-context.util';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { RequiresGroupScope } from '@/modules/auth/decorators/requires-group-scope.decorator';
import { GroupScopeGuard } from '@/modules/auth/guards/group-scope.guard';
import { GroupScopeSubject } from '@/modules/auth/guards/group-scope.subject';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { RemoveTechnicalVisitDocs } from '../docs/remove-technical-visit.docs';
import { TechnicalVisitParamDTO } from '../dtos/technical-visit-param.dto';
import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import { RemoveTechnicalVisitService } from '../services/remove-technical-visit.service';

@ApiTags('Technical Visits')
@Controller('technical-visits')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class RemoveTechnicalVisitController {
  constructor(private readonly service: RemoveTechnicalVisitService) {}

  @Delete(':technicalVisitId')
  @RequirePermission('technical_visit', 'delete')
  @RequiresGroupScope(GroupScopeSubject.TECHNICAL_VISIT, 'technicalVisitId')
  @RemoveTechnicalVisitDocs()
  handle(
    @Param() params: TechnicalVisitParamDTO,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ): Promise<TechnicalVisitResponseDTO> {
    return this.service.execute(
      params.technicalVisitId,
      actor,
      buildAuditContext(actor, request),
    );
  }
}
