import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { RequiresGroupScope } from '@/modules/auth/decorators/requires-group-scope.decorator';
import { GroupScopeGuard } from '@/modules/auth/guards/group-scope.guard';
import { GroupScopeSubject } from '@/modules/auth/guards/group-scope.subject';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';

import { FindLandingRequestByIdDocs } from '../docs/find-landing-request-by-id.docs';
import { LandingRequestParamDTO } from '../dtos/landing-request-param.dto';
import { LandingRequestResponseDTO } from '../dtos/landing-request-response.dto';
import { FindLandingRequestByIdService } from '../services/find-landing-request-by-id.service';

@ApiTags('Landing Requests')
@Controller('landing-requests')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class FindLandingRequestByIdController {
  constructor(private readonly service: FindLandingRequestByIdService) {}

  @Get(':id')
  @RequirePermission('landing_request', 'read')
  @RequiresGroupScope(GroupScopeSubject.LANDING_REQUEST)
  @FindLandingRequestByIdDocs()
  handle(
    @Param() { id }: LandingRequestParamDTO,
  ): Promise<LandingRequestResponseDTO> {
    return this.service.execute(id);
  }
}
