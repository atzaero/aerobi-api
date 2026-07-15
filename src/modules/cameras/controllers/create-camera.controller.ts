import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { CreateCameraDocs } from '../docs/create-camera.docs';
import { CameraResponseDTO } from '../dtos/camera-response.dto';
import { CreateCameraDTO } from '../dtos/create-camera.dto';
import { CreateCameraService } from '../services/create-camera.service';

@ApiTags('Cameras')
@Controller('cameras')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CreateCameraController {
  constructor(private readonly service: CreateCameraService) {}

  @Post()
  @RequirePermission('camera', 'create')
  @CreateCameraDocs()
  handle(
    @Body() dto: CreateCameraDTO,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<CameraResponseDTO> {
    return this.service.execute(dto, actor);
  }
}
