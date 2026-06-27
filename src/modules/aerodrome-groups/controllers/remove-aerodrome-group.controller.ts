import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { RemoveAerodromeGroupDocs } from '../docs/remove-aerodrome-group.docs';
import { AerodromeGroupDeletionResponseDTO } from '../dtos/aerodrome-group-deletion-response.dto';
import { AerodromeGroupParamDTO } from '../dtos/aerodrome-group-param.dto';
import { RemoveAerodromeGroupService } from '../services/remove-aerodrome-group.service';

@ApiTags('Aerodrome Groups')
@Controller('aerodrome-groups')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RemoveAerodromeGroupController {
  constructor(private readonly service: RemoveAerodromeGroupService) {}

  @Delete(':id')
  @RequirePermission('group', 'delete')
  @RemoveAerodromeGroupDocs()
  handle(
    @Param() { id }: AerodromeGroupParamDTO,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<AerodromeGroupDeletionResponseDTO> {
    return this.service.execute(id, actor);
  }
}
