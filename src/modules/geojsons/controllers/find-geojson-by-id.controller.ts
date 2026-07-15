import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { RequiresGroupScope } from '@/modules/auth/decorators/requires-group-scope.decorator';
import { GroupScopeGuard } from '@/modules/auth/guards/group-scope.guard';
import { GroupScopeSubject } from '@/modules/auth/guards/group-scope.subject';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';

import { FindGeojsonByIdDocs } from '../docs/find-geojson-by-id.docs';
import { GeojsonParamDTO } from '../dtos/geojson-param.dto';
import { GeojsonResponseDTO } from '../dtos/geojson-response.dto';
import { FindGeojsonByIdService } from '../services/find-geojson-by-id.service';

@ApiTags('Geojsons')
@Controller('geojsons')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class FindGeojsonByIdController {
  constructor(private readonly service: FindGeojsonByIdService) {}

  @Get(':id')
  @RequirePermission('aerodrome', 'read')
  @RequiresGroupScope(GroupScopeSubject.GEOJSON)
  @FindGeojsonByIdDocs()
  handle(@Param() { id }: GeojsonParamDTO): Promise<GeojsonResponseDTO> {
    return this.service.execute({ id });
  }
}
