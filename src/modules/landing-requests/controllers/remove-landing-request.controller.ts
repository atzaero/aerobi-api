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

import { RemoveLandingRequestDocs } from '../docs/remove-landing-request.docs';
import { LandingRequestParamDTO } from '../dtos/landing-request-param.dto';
import { LandingRequestResponseDTO } from '../dtos/landing-request-response.dto';
import { RemoveLandingRequestService } from '../services/remove-landing-request.service';

@ApiTags('Landing Requests')
@Controller('landing-requests')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class RemoveLandingRequestController {
  constructor(private readonly service: RemoveLandingRequestService) {}

  @Delete(':id')
  @RequirePermission('landing_request', 'delete')
  @RequiresGroupScope(GroupScopeSubject.LANDING_REQUEST)
  @RemoveLandingRequestDocs()
  handle(
    @Param() { id }: LandingRequestParamDTO,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ): Promise<LandingRequestResponseDTO> {
    return this.service.execute(id, actor, buildAuditContext(actor, request));
  }
}
