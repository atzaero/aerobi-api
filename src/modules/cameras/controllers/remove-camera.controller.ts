import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { RequiresGroupScope } from '@/modules/auth/decorators/requires-group-scope.decorator';
import { GroupScopeGuard } from '@/modules/auth/guards/group-scope.guard';
import { GroupScopeSubject } from '@/modules/auth/guards/group-scope.subject';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { RemoveCameraDocs } from '../docs/remove-camera.docs';
import { CameraParamDTO } from '../dtos/camera-param.dto';
import { CameraResponseDTO } from '../dtos/camera-response.dto';
import { RemoveCameraService } from '../services/remove-camera.service';

@ApiTags('Cameras')
@Controller('cameras')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class RemoveCameraController {
  constructor(private readonly service: RemoveCameraService) {}

  @Delete(':id')
  @RequirePermission('camera', 'delete')
  @RequiresGroupScope(GroupScopeSubject.CAMERA)
  @RemoveCameraDocs()
  handle(
    @Param() { id }: CameraParamDTO,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<CameraResponseDTO> {
    return this.service.execute({ id, deletedBy: actor.id });
  }
}
