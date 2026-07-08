import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { RequiresGroupScope } from '@/modules/auth/decorators/requires-group-scope.decorator';
import { GroupScopeGuard } from '@/modules/auth/guards/group-scope.guard';
import { GroupScopeSubject } from '@/modules/auth/guards/group-scope.subject';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';

import { FindTechnicalVisitByIdDocs } from '../docs/find-technical-visit-by-id.docs';
import { TechnicalVisitParamDTO } from '../dtos/technical-visit-param.dto';
import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import { FindTechnicalVisitByIdService } from '../services/find-technical-visit-by-id.service';

@ApiTags('Technical Visits')
@Controller('technical-visits')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class FindTechnicalVisitByIdController {
  constructor(private readonly service: FindTechnicalVisitByIdService) {}

  @Get(':technicalVisitId')
  @RequirePermission('technical_visit', 'read')
  @RequiresGroupScope(GroupScopeSubject.TECHNICAL_VISIT, 'technicalVisitId')
  @FindTechnicalVisitByIdDocs()
  handle(
    @Param() params: TechnicalVisitParamDTO,
  ): Promise<TechnicalVisitResponseDTO> {
    return this.service.execute({ id: params.technicalVisitId });
  }
}
