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

import { RemoveTechnicalVisitImageDocs } from '../docs/remove-technical-visit-image.docs';
import { TechnicalVisitImageParamDTO } from '../dtos/technical-visit-image-param.dto';
import { TechnicalVisitImageResponseDTO } from '../dtos/technical-visit-image-response.dto';
import { RemoveTechnicalVisitImageService } from '../services/remove-technical-visit-image.service';

@ApiTags('Technical Visits')
@Controller('technical-visits')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class RemoveTechnicalVisitImageController {
  constructor(private readonly service: RemoveTechnicalVisitImageService) {}

  @Delete(':technicalVisitId/images/:imageId')
  @RequirePermission('technical_visit', 'update')
  @RequiresGroupScope(GroupScopeSubject.TECHNICAL_VISIT_IMAGE, 'imageId')
  @RemoveTechnicalVisitImageDocs()
  handle(
    @Param() params: TechnicalVisitImageParamDTO,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ): Promise<TechnicalVisitImageResponseDTO> {
    return this.service.execute(
      params.technicalVisitId,
      params.imageId,
      actor,
      buildAuditContext(actor, request),
    );
  }
}
