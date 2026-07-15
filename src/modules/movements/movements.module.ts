import { Module } from '@nestjs/common';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';
import { PrismaModule } from '@/prisma/prisma.module';
import { AerodromesModule } from '@/modules/aerodromes/aerodromes.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { RabModule } from '@/modules/rab/rab.module';
import { StorageModule } from '@/modules/storage/storage.module';
import { UsersModule } from '@/modules/users/users.module';

import { BatchCreateMovementController } from './controllers/batch-create-movement.controller';
import { CreateManualMovementController } from './controllers/create-manual-movement.controller';
import { CreateMovementController } from './controllers/create-movement.controller';
import { ExportMovementsController } from './controllers/export-movements.controller';
import { FindMovementByIdCanonicalController } from './controllers/find-movement-by-id-canonical.controller';
import { ListMovementsCanonicalController } from './controllers/list-movements-canonical.controller';
import { RemoveMovementCanonicalController } from './controllers/remove-movement-canonical.controller';
import { UpdateMovementCanonicalController } from './controllers/update-movement-canonical.controller';
import { MovementConformityListener } from './listeners/movement-conformity.listener';
import { MovementRepository } from './repositories/movement.repository';
import { BatchCreateMovementService } from './services/batch-create-movement.service';
import { CreateMovementService } from './services/create-movement.service';
import { ExportMovementsService } from './services/export-movements.service';
import { FindMovementByIdService } from './services/find-movement-by-id.service';
import { ListMovementsService } from './services/list-movements.service';
import { MovementScopeService } from './services/movement-scope.service';
import { RemoveMovementService } from './services/remove-movement.service';
import { UpdateMovementService } from './services/update-movement.service';

/**
 * Módulo de movimentos (movements) — pousos e decolagens de aeronaves. A
 * ingestão automática (`POST /readings` + `/readings/batch`, aviascan-cv) fica
 * sob `AerobiApiKeyGuard` (integração externa); as rotas de **gestão**
 * (`/movements*`) usam JWT + RBAC (`AuthModule`) com escopo por grupo resolvido
 * pelos ICAOs do grupo do ator (`UsersModule` para o lookup do ator,
 * `AerodromesModule` para os ICAOs).
 */
@Module({
  imports: [
    PrismaModule,
    StorageModule,
    RabModule,
    AuthModule,
    UsersModule,
    AerodromesModule,
  ],
  controllers: [
    CreateMovementController,
    BatchCreateMovementController,
    CreateManualMovementController,
    ListMovementsCanonicalController,
    ExportMovementsController,
    FindMovementByIdCanonicalController,
    RemoveMovementCanonicalController,
    UpdateMovementCanonicalController,
  ],
  providers: [
    AerobiApiKeyGuard,
    MovementRepository,
    MovementScopeService,
    CreateMovementService,
    BatchCreateMovementService,
    ListMovementsService,
    ExportMovementsService,
    FindMovementByIdService,
    RemoveMovementService,
    UpdateMovementService,
    MovementConformityListener,
  ],
})
export class MovementsModule {}
