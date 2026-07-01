import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { RequiresGroupScope } from '@/modules/auth/decorators/requires-group-scope.decorator';
import { GroupScopeGuard } from '@/modules/auth/guards/group-scope.guard';
import { GroupScopeSubject } from '@/modules/auth/guards/group-scope.subject';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { UpdateAerodromeObservationDocs } from '../docs/update-aerodrome-observation.docs';
import { AerodromeParamDTO } from '../dtos/aerodrome-param.dto';
import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';
import { UpdateAerodromeObservationDTO } from '../dtos/update-aerodrome-observation.dto';
import { UpdateAerodromeObservationService } from '../services/update-aerodrome-observation.service';

/**
 * Atualiza apenas a observação pública. Permissão dedicada
 * `aerodrome:update-observation` (inclui OPERATOR, além de ADMIN/COORDINATOR) +
 * escopo por grupo.
 */
@ApiTags('Aerodromes')
@Controller('aerodromes')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class UpdateAerodromeObservationController {
  constructor(private readonly service: UpdateAerodromeObservationService) {}

  @Patch(':id/observation')
  @RequirePermission('aerodrome', 'update-observation')
  @RequiresGroupScope(GroupScopeSubject.AERODROME)
  @UpdateAerodromeObservationDocs()
  handle(
    @Param() { id }: AerodromeParamDTO,
    @Body() dto: UpdateAerodromeObservationDTO,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<AerodromeResponseDTO> {
    return this.service.execute(id, dto, actor);
  }
}
