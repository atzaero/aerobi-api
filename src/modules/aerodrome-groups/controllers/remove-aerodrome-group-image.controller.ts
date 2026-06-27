import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { RemoveAerodromeGroupImageDocs } from '../docs/remove-aerodrome-group-image.docs';
import { AerodromeGroupParamDTO } from '../dtos/aerodrome-group-param.dto';
import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';
import { RemoveAerodromeGroupImageService } from '../services/remove-aerodrome-group-image.service';

@ApiTags('Aerodrome Groups')
@Controller('aerodrome-groups')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RemoveAerodromeGroupImageController {
  constructor(private readonly service: RemoveAerodromeGroupImageService) {}

  @Delete(':id/image')
  @RequirePermission('group', 'update')
  @RemoveAerodromeGroupImageDocs()
  handle(
    @Param() { id }: AerodromeGroupParamDTO,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<AerodromeGroupResponseDTO> {
    return this.service.execute(id, actor);
  }
}
