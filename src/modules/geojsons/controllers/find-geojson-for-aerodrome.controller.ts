import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { RequiresGroupScope } from '@/modules/auth/decorators/requires-group-scope.decorator';
import { GroupScopeGuard } from '@/modules/auth/guards/group-scope.guard';
import { GroupScopeSubject } from '@/modules/auth/guards/group-scope.subject';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';

import { FindGeojsonForAerodromeDocs } from '../docs/find-geojson-for-aerodrome.docs';
import { GeojsonForAerodromeResponseDTO } from '../dtos/geojson-for-aerodrome-response.dto';
import { GeojsonParamDTO } from '../dtos/geojson-param.dto';
import { FindGeojsonForAerodromeService } from '../services/find-geojson-for-aerodrome.service';

/**
 * Leitura do GeoJSON por aeródromo (paridade com a única action do web). O param
 * `id` **é** o `aerodromeId` — daí o escopo por `GroupScopeSubject.AERODROME`.
 */
@ApiTags('Geojsons')
@Controller('geojsons')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class FindGeojsonForAerodromeController {
  constructor(private readonly service: FindGeojsonForAerodromeService) {}

  @Get('aerodrome/:id')
  @RequirePermission('aerodrome', 'read')
  @RequiresGroupScope(GroupScopeSubject.AERODROME)
  @FindGeojsonForAerodromeDocs()
  handle(
    @Param() { id }: GeojsonParamDTO,
  ): Promise<GeojsonForAerodromeResponseDTO> {
    return this.service.execute({ aerodromeId: id });
  }
}
