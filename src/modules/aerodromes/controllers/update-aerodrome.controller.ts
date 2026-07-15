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

import { UpdateAerodromeDocs } from '../docs/update-aerodrome.docs';
import { AerodromeParamDTO } from '../dtos/aerodrome-param.dto';
import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';
import { UpdateAerodromeDTO } from '../dtos/update-aerodrome.dto';
import { UpdateAerodromeService } from '../services/update-aerodrome.service';

@ApiTags('Aerodromes')
@Controller('aerodromes')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class UpdateAerodromeController {
  constructor(private readonly service: UpdateAerodromeService) {}

  @Patch(':id')
  @RequirePermission('aerodrome', 'update')
  @RequiresGroupScope(GroupScopeSubject.AERODROME)
  @UpdateAerodromeDocs()
  handle(
    @Param() { id }: AerodromeParamDTO,
    @Body() dto: UpdateAerodromeDTO,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<AerodromeResponseDTO> {
    return this.service.execute(id, dto, actor);
  }
}
