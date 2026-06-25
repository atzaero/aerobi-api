import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth/auth.module';
import { StorageModule } from '@/modules/storage/storage.module';
import { UsersModule } from '@/modules/users/users.module';
import { PrismaModule } from '@/prisma/prisma.module';

import { CreateAerodromeGroupController } from './controllers/create-aerodrome-group.controller';
import { ExportAerodromeGroupsController } from './controllers/export-aerodrome-groups.controller';
import { FindAerodromeGroupByIdController } from './controllers/find-aerodrome-group-by-id.controller';
import { ListAerodromeGroupsController } from './controllers/list-aerodrome-groups.controller';
import { RemoveAerodromeGroupController } from './controllers/remove-aerodrome-group.controller';
import { RemoveAerodromeGroupImageController } from './controllers/remove-aerodrome-group-image.controller';
import { UpdateAerodromeGroupController } from './controllers/update-aerodrome-group.controller';
import { UploadAerodromeGroupImageController } from './controllers/upload-aerodrome-group-image.controller';

import { AerodromeGroupImageRepository } from './repositories/aerodrome-group-image.repository';
import { AerodromeGroupRepository } from './repositories/aerodrome-group.repository';

import { CreateAerodromeGroupService } from './services/create-aerodrome-group.service';
import { ExportAerodromeGroupsService } from './services/export-aerodrome-groups.service';
import { FindAerodromeGroupByIdService } from './services/find-aerodrome-group-by-id.service';
import { ListAerodromeGroupsService } from './services/list-aerodrome-groups.service';
import { RemoveAerodromeGroupService } from './services/remove-aerodrome-group.service';
import { RemoveAerodromeGroupImageService } from './services/remove-aerodrome-group-image.service';
import { UpdateAerodromeGroupService } from './services/update-aerodrome-group.service';
import { UploadAerodromeGroupImageService } from './services/upload-aerodrome-group-image.service';

/**
 * Importa `AuthModule` (guards JWT/permissões/escopo via `@UseGuards`),
 * `UsersModule` (`UserRepository`, para o lookup do escopo do coordinator) e
 * `StorageModule` (`StorageService`, para upload/presigned das imagens).
 */
@Module({
  imports: [PrismaModule, AuthModule, UsersModule, StorageModule],
  controllers: [
    CreateAerodromeGroupController,
    UpdateAerodromeGroupController,
    ListAerodromeGroupsController,
    /** `/export` deve preceder `/:id`, senão a rota cai no handler de busca por id. */
    ExportAerodromeGroupsController,
    UploadAerodromeGroupImageController,
    RemoveAerodromeGroupImageController,
    FindAerodromeGroupByIdController,
    RemoveAerodromeGroupController,
  ],
  providers: [
    AerodromeGroupRepository,
    AerodromeGroupImageRepository,
    CreateAerodromeGroupService,
    UpdateAerodromeGroupService,
    ListAerodromeGroupsService,
    ExportAerodromeGroupsService,
    UploadAerodromeGroupImageService,
    RemoveAerodromeGroupImageService,
    FindAerodromeGroupByIdService,
    RemoveAerodromeGroupService,
  ],
})
export class AerodromeGroupsModule {}
