import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { RequiresGroupScope } from '@/modules/auth/decorators/requires-group-scope.decorator';
import { GroupScopeGuard } from '@/modules/auth/guards/group-scope.guard';
import { GroupScopeSubject } from '@/modules/auth/guards/group-scope.subject';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';

import { ListTechnicalVisitImagesDocs } from '../docs/list-technical-visit-images.docs';
import { TechnicalVisitImageResponseDTO } from '../dtos/technical-visit-image-response.dto';
import { TechnicalVisitParamDTO } from '../dtos/technical-visit-param.dto';
import { ListTechnicalVisitImagesService } from '../services/list-technical-visit-images.service';

@ApiTags('Technical Visits')
@Controller('technical-visits')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class ListTechnicalVisitImagesController {
  constructor(private readonly service: ListTechnicalVisitImagesService) {}

  @Get(':technicalVisitId/images')
  @RequirePermission('technical_visit', 'read')
  @RequiresGroupScope(GroupScopeSubject.TECHNICAL_VISIT, 'technicalVisitId')
  @ListTechnicalVisitImagesDocs()
  handle(
    @Param() params: TechnicalVisitParamDTO,
  ): Promise<TechnicalVisitImageResponseDTO[]> {
    return this.service.execute(params.technicalVisitId);
  }
}
