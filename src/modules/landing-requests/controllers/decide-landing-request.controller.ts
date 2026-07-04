import { Body, Controller, Param, Patch, Req, UseGuards } from '@nestjs/common';
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

import { DecideLandingRequestDocs } from '../docs/decide-landing-request.docs';
import { DecideLandingRequestDTO } from '../dtos/decide-landing-request.dto';
import { LandingRequestParamDTO } from '../dtos/landing-request-param.dto';
import { LandingRequestResponseDTO } from '../dtos/landing-request-response.dto';
import { DecideLandingRequestService } from '../services/decide-landing-request.service';

@ApiTags('Landing Requests')
@Controller('landing-requests')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class DecideLandingRequestController {
  constructor(private readonly service: DecideLandingRequestService) {}

  @Patch(':id/decision')
  @RequirePermission('landing_request', 'decide')
  @RequiresGroupScope(GroupScopeSubject.LANDING_REQUEST)
  @DecideLandingRequestDocs()
  handle(
    @Param() { id }: LandingRequestParamDTO,
    @Body() dto: DecideLandingRequestDTO,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ): Promise<LandingRequestResponseDTO> {
    return this.service.execute(
      id,
      dto,
      actor,
      buildAuditContext(actor, request),
    );
  }
}
