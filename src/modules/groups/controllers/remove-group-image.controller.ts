import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { RemoveGroupImageDocs } from '../docs/remove-group-image.docs';
import { GroupParamDTO } from '../dtos/group-param.dto';
import { GroupResponseDTO } from '../dtos/group-response.dto';
import { RemoveGroupImageService } from '../services/remove-group-image.service';

@ApiTags('Groups')
@Controller('groups')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RemoveGroupImageController {
  constructor(private readonly service: RemoveGroupImageService) {}

  @Delete(':id/image')
  @RequirePermission('group', 'update')
  @RemoveGroupImageDocs()
  handle(
    @Param() { id }: GroupParamDTO,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<GroupResponseDTO> {
    return this.service.execute(id, actor);
  }
}
