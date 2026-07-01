import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { PrismaModule } from '@/prisma/prisma.module';

import { CreateAerodromeController } from './controllers/create-aerodrome.controller';
import { ExportAerodromesController } from './controllers/export-aerodromes.controller';
import { FindAerodromeByIdController } from './controllers/find-aerodrome-by-id.controller';
import { ListAerodromesController } from './controllers/list-aerodromes.controller';
import { RemoveAerodromeController } from './controllers/remove-aerodrome.controller';
import { SetAerodromeStatusController } from './controllers/set-aerodrome-status.controller';
import { UpdateAerodromeController } from './controllers/update-aerodrome.controller';
import { UpdateAerodromeObservationController } from './controllers/update-aerodrome-observation.controller';

import { AerodromeRepository } from './repositories/aerodrome.repository';

import { CreateAerodromeService } from './services/create-aerodrome.service';
import { ExportAerodromesService } from './services/export-aerodromes.service';
import { FindAerodromeByIdService } from './services/find-aerodrome-by-id.service';
import { ListAerodromesService } from './services/list-aerodromes.service';
import { RemoveAerodromeService } from './services/remove-aerodrome.service';
import { SetAerodromeStatusService } from './services/set-aerodrome-status.service';
import { UpdateAerodromeService } from './services/update-aerodrome.service';
import { UpdateAerodromeObservationService } from './services/update-aerodrome-observation.service';

/**
 * Importa `AuthModule` (guards JWT/permissões/escopo via `@UseGuards`) e
 * `UsersModule` (`UserRepository`, para o lookup do escopo de grupo do ator nos
 * services de list/create).
 */
@Module({
  imports: [PrismaModule, AuthModule, UsersModule],
  controllers: [
    CreateAerodromeController,
    UpdateAerodromeController,
    UpdateAerodromeObservationController,
    SetAerodromeStatusController,
    ListAerodromesController,
    /**
     * `/export` deve preceder `/:id` (Express 5 não tem regex no param de rota):
     * senão `GET /aerodromes/export` cai no handler de busca por id. A invariante
     * é travada por `aerodromes.module.spec.ts`.
     */
    ExportAerodromesController,
    FindAerodromeByIdController,
    RemoveAerodromeController,
  ],
  providers: [
    AerodromeRepository,
    CreateAerodromeService,
    UpdateAerodromeService,
    UpdateAerodromeObservationService,
    SetAerodromeStatusService,
    ListAerodromesService,
    ExportAerodromesService,
    FindAerodromeByIdService,
    RemoveAerodromeService,
  ],
})
export class AerodromesModule {}
