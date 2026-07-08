import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { PrismaModule } from '@/prisma/prisma.module';

import { CreateCameraController } from './controllers/create-camera.controller';
import { FindCameraByIdController } from './controllers/find-camera-by-id.controller';
import { ListCamerasController } from './controllers/list-cameras.controller';
import { RemoveCameraController } from './controllers/remove-camera.controller';
import { UpdateCameraController } from './controllers/update-camera.controller';

import { CameraRepository } from './repositories/camera.repository';

import { CameraQueryService } from './services/camera-query.service';
import { CreateCameraService } from './services/create-camera.service';
import { FindCameraByIdService } from './services/find-camera-by-id.service';
import { ListCamerasService } from './services/list-cameras.service';
import { RemoveCameraService } from './services/remove-camera.service';
import { UpdateCameraService } from './services/update-camera.service';

/**
 * Módulo CRUD interno de câmeras (metadados no Postgres). Todas as rotas exigem
 * JWT + `PermissionsGuard` (`camera:*`); as rotas com `:id` (get/update/delete)
 * usam `GroupScopeGuard`, e create/list resolvem o escopo do ator no service.
 * Importa `AuthModule` (guards) e `UsersModule` (`UserRepository`, lookup do
 * escopo de grupo do ator). Este módulo não expõe rota pública.
 *
 * **Exporta** o {@link CameraQueryService} — read-model (com cache) consumido
 * pelo proxy HLS público `camera-streams` (#473); o CRUD invalida esse cache a
 * cada mutação.
 */
@Module({
  imports: [PrismaModule, AuthModule, UsersModule],
  controllers: [
    CreateCameraController,
    UpdateCameraController,
    ListCamerasController,
    FindCameraByIdController,
    RemoveCameraController,
  ],
  providers: [
    CameraRepository,
    CameraQueryService,
    CreateCameraService,
    UpdateCameraService,
    ListCamerasService,
    FindCameraByIdService,
    RemoveCameraService,
  ],
  exports: [CameraQueryService],
})
export class CamerasModule {}
