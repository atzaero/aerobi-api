import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { RequiresGroupScope } from '@/modules/auth/decorators/requires-group-scope.decorator';
import { GroupScopeGuard } from '@/modules/auth/guards/group-scope.guard';
import { GroupScopeSubject } from '@/modules/auth/guards/group-scope.subject';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';

import { FindCameraByIdDocs } from '../docs/find-camera-by-id.docs';
import { CameraParamDTO } from '../dtos/camera-param.dto';
import { CameraResponseDTO } from '../dtos/camera-response.dto';
import { FindCameraByIdService } from '../services/find-camera-by-id.service';

@ApiTags('Cameras')
@Controller('cameras')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class FindCameraByIdController {
  constructor(private readonly service: FindCameraByIdService) {}

  @Get(':id')
  @RequirePermission('camera', 'read')
  @RequiresGroupScope(GroupScopeSubject.CAMERA)
  @FindCameraByIdDocs()
  handle(@Param() { id }: CameraParamDTO): Promise<CameraResponseDTO> {
    return this.service.execute({ id });
  }
}
