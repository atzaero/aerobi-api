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

import { UpdateCameraDocs } from '../docs/update-camera.docs';
import { CameraParamDTO } from '../dtos/camera-param.dto';
import { CameraResponseDTO } from '../dtos/camera-response.dto';
import { UpdateCameraDTO } from '../dtos/update-camera.dto';
import { UpdateCameraService } from '../services/update-camera.service';

@ApiTags('Cameras')
@Controller('cameras')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class UpdateCameraController {
  constructor(private readonly service: UpdateCameraService) {}

  @Patch(':id')
  @RequirePermission('camera', 'update')
  @RequiresGroupScope(GroupScopeSubject.CAMERA)
  @UpdateCameraDocs()
  handle(
    @Param() { id }: CameraParamDTO,
    @Body() dto: UpdateCameraDTO,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<CameraResponseDTO> {
    return this.service.execute(id, dto, actor);
  }
}
