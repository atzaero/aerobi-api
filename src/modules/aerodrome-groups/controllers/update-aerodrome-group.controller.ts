import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { UpdateAerodromeGroupDocs } from '../docs/update-aerodrome-group.docs';
import { AerodromeGroupParamDTO } from '../dtos/aerodrome-group-param.dto';
import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';
import { UpdateAerodromeGroupDTO } from '../dtos/update-aerodrome-group.dto';
import { UpdateAerodromeGroupService } from '../services/update-aerodrome-group.service';

@ApiTags('Aerodrome Groups')
@Controller('aerodrome-groups')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UpdateAerodromeGroupController {
  constructor(private readonly service: UpdateAerodromeGroupService) {}

  @Patch(':id')
  @RequirePermission('group', 'update')
  @UpdateAerodromeGroupDocs()
  handle(
    @Param() { id }: AerodromeGroupParamDTO,
    @Body() dto: UpdateAerodromeGroupDTO,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<AerodromeGroupResponseDTO> {
    return this.service.execute(id, dto, actor);
  }
}
