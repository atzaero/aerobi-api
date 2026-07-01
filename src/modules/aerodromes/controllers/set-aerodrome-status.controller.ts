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

import { SetAerodromeStatusDocs } from '../docs/set-aerodrome-status.docs';
import { AerodromeParamDTO } from '../dtos/aerodrome-param.dto';
import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';
import { SetAerodromeStatusDTO } from '../dtos/set-aerodrome-status.dto';
import { SetAerodromeStatusService } from '../services/set-aerodrome-status.service';

/**
 * Alterna um campo de status (`isOpen`/`isView`/`weatherStationDisplay`/`lit`).
 * Reusa a permissão `aerodrome:update` (paridade com o web) + escopo por grupo.
 */
@ApiTags('Aerodromes')
@Controller('aerodromes')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class SetAerodromeStatusController {
  constructor(private readonly service: SetAerodromeStatusService) {}

  @Patch(':id/status')
  @RequirePermission('aerodrome', 'update')
  @RequiresGroupScope(GroupScopeSubject.AERODROME)
  @SetAerodromeStatusDocs()
  handle(
    @Param() { id }: AerodromeParamDTO,
    @Body() dto: SetAerodromeStatusDTO,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<AerodromeResponseDTO> {
    return this.service.execute(id, dto, actor);
  }
}
