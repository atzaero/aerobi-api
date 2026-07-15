import { Module } from '@nestjs/common';

import { AuditModule } from '@/modules/audit/audit.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { StorageModule } from '@/modules/storage/storage.module';
import { UsersModule } from '@/modules/users/users.module';
import { PrismaModule } from '@/prisma/prisma.module';

import { CreateGroupController } from './controllers/create-group.controller';
import { ExportGroupsController } from './controllers/export-groups.controller';
import { FindGroupByIdController } from './controllers/find-group-by-id.controller';
import { ListGroupsController } from './controllers/list-groups.controller';
import { RemoveGroupController } from './controllers/remove-group.controller';
import { RemoveGroupImageController } from './controllers/remove-group-image.controller';
import { UpdateGroupController } from './controllers/update-group.controller';
import { UploadGroupImageController } from './controllers/upload-group-image.controller';

import { GroupImageRepository } from './repositories/group-image.repository';
import { GroupRepository } from './repositories/group.repository';

import { CreateGroupService } from './services/create-group.service';
import { ExportGroupsService } from './services/export-groups.service';
import { FindGroupByIdService } from './services/find-group-by-id.service';
import { ListGroupsService } from './services/list-groups.service';
import { RemoveGroupService } from './services/remove-group.service';
import { RemoveGroupImageService } from './services/remove-group-image.service';
import { UpdateGroupService } from './services/update-group.service';
import { UploadGroupImageService } from './services/upload-group-image.service';

/**
 * Importa `AuthModule` (guards JWT/permissões/escopo via `@UseGuards`),
 * `UsersModule` (`UserRepository`, para o lookup do escopo do coordinator),
 * `StorageModule` (`StorageService`, para upload/presigned das imagens) e
 * `AuditModule` (`AuditRecorderService`, para gravar a trilha nas mutações).
 */
@Module({
  imports: [PrismaModule, AuthModule, UsersModule, StorageModule, AuditModule],
  controllers: [
    CreateGroupController,
    UpdateGroupController,
    ListGroupsController,
    /**
     * `/export` deve preceder `/:id` (Express 5 não tem regex no param de rota):
     * senão `GET /groups/export` cai no handler de busca por id. A
     * invariante é travada por `groups.module.spec.ts`.
     */
    ExportGroupsController,
    UploadGroupImageController,
    RemoveGroupImageController,
    FindGroupByIdController,
    RemoveGroupController,
  ],
  providers: [
    GroupRepository,
    GroupImageRepository,
    CreateGroupService,
    UpdateGroupService,
    ListGroupsService,
    ExportGroupsService,
    UploadGroupImageService,
    RemoveGroupImageService,
    FindGroupByIdService,
    RemoveGroupService,
  ],
})
export class GroupsModule {}
