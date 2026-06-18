import { Module } from '@nestjs/common';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';
import { PrismaModule } from '@/prisma/prisma.module';
import { RabModule } from '@/modules/rab/rab.module';
import { StorageModule } from '@/modules/storage/storage.module';

import { BatchCreateMovementController } from './controllers/batch-create-movement.controller';
import { CreateManualMovementController } from './controllers/create-manual-movement.controller';
import { CreateMovementController } from './controllers/create-movement.controller';
import { FindMovementByIdCanonicalController } from './controllers/find-movement-by-id-canonical.controller';
import { FindMovementByIdController } from './controllers/find-movement-by-id.controller';
import { ListMovementsCanonicalController } from './controllers/list-movements-canonical.controller';
import { ListMovementsController } from './controllers/list-movements.controller';
import { RemoveMovementCanonicalController } from './controllers/remove-movement-canonical.controller';
import { RemoveMovementController } from './controllers/remove-movement.controller';
import { UpdateMovementCanonicalController } from './controllers/update-movement-canonical.controller';
import { MovementRepository } from './repositories/movement.repository';
import { BatchCreateMovementService } from './services/batch-create-movement.service';
import { CreateMovementService } from './services/create-movement.service';
import { FindMovementByIdService } from './services/find-movement-by-id.service';
import { ListMovementsService } from './services/list-movements.service';
import { RemoveMovementService } from './services/remove-movement.service';
import { UpdateMovementService } from './services/update-movement.service';

/**
 * Módulo de movimentos (movements) — pousos e decolagens de aeronaves. Recebe os
 * movimentos automáticos do pipeline aviascan-cv (via rota legada `/readings`),
 * persiste em Postgres e guarda as imagens no MinIO.
 */
@Module({
  imports: [PrismaModule, StorageModule, RabModule],
  controllers: [
    CreateMovementController,
    BatchCreateMovementController,
    CreateManualMovementController,
    ListMovementsCanonicalController,
    FindMovementByIdCanonicalController,
    RemoveMovementCanonicalController,
    UpdateMovementCanonicalController,
    ListMovementsController,
    FindMovementByIdController,
    RemoveMovementController,
  ],
  providers: [
    AerobiApiKeyGuard,
    MovementRepository,
    CreateMovementService,
    BatchCreateMovementService,
    ListMovementsService,
    FindMovementByIdService,
    RemoveMovementService,
    UpdateMovementService,
  ],
})
export class MovementsModule {}
