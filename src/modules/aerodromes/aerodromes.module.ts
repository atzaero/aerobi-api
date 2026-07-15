import { Module } from '@nestjs/common';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';
import { AuthModule } from '@/modules/auth/auth.module';
import { DocumentsModule } from '@/modules/documents/documents.module';
import { UsersModule } from '@/modules/users/users.module';
import { PrismaModule } from '@/prisma/prisma.module';

import { CreateAerodromeController } from './controllers/create-aerodrome.controller';
import { ExportAerodromesController } from './controllers/export-aerodromes.controller';
import { FindAerodromeByIdController } from './controllers/find-aerodrome-by-id.controller';
import { FindVisibleAerodromeByIcaoController } from './controllers/find-visible-aerodrome-by-icao.controller';
import { ListAerodromesController } from './controllers/list-aerodromes.controller';
import { ListVisibleAerodromesController } from './controllers/list-visible-aerodromes.controller';
import { RemoveAerodromeController } from './controllers/remove-aerodrome.controller';
import { SetAerodromeStatusController } from './controllers/set-aerodrome-status.controller';
import { UpdateAerodromeController } from './controllers/update-aerodrome.controller';
import { UpdateAerodromeObservationController } from './controllers/update-aerodrome-observation.controller';

import { AerodromeRepository } from './repositories/aerodrome.repository';

import { CreateAerodromeService } from './services/create-aerodrome.service';
import { ExportAerodromesService } from './services/export-aerodromes.service';
import { FindAerodromeByIdService } from './services/find-aerodrome-by-id.service';
import { FindVisibleAerodromeByIcaoService } from './services/find-visible-aerodrome-by-icao.service';
import { ListAerodromesService } from './services/list-aerodromes.service';
import { ListVisibleAerodromesService } from './services/list-visible-aerodromes.service';
import { RemoveAerodromeService } from './services/remove-aerodrome.service';
import { SetAerodromeStatusService } from './services/set-aerodrome-status.service';
import { UpdateAerodromeService } from './services/update-aerodrome.service';
import { UpdateAerodromeObservationService } from './services/update-aerodrome-observation.service';

/**
 * Importa `AuthModule` (guards JWT/permissões/escopo via `@UseGuards`) e
 * `UsersModule` (`UserRepository`, para o lookup do escopo de grupo do ator nos
 * services de list/create). `AerobiApiKeyGuard` cobre as rotas públicas
 * `/visible` (mapa/ficha). `DocumentsModule` expõe o `AerodromeFileUrlsService`
 * para resolver `imgUrl`/`kmlUrl` on-read no detalhe (#550) e na ficha pública
 * `GET /aerodromes/visible/:icao` (#551).
 */
@Module({
  imports: [PrismaModule, AuthModule, UsersModule, DocumentsModule],
  controllers: [
    CreateAerodromeController,
    UpdateAerodromeController,
    UpdateAerodromeObservationController,
    SetAerodromeStatusController,
    ListAerodromesController,
    /**
     * `/export`, `/visible` e `/visible/:icao` devem preceder `/:id` (Express 5
     * não tem regex no param de rota): senão esses paths caem no handler de
     * busca por id. A invariante é travada por `aerodromes.module.spec.ts`.
     */
    ExportAerodromesController,
    ListVisibleAerodromesController,
    FindVisibleAerodromeByIcaoController,
    FindAerodromeByIdController,
    RemoveAerodromeController,
  ],
  providers: [
    AerobiApiKeyGuard,
    AerodromeRepository,
    CreateAerodromeService,
    UpdateAerodromeService,
    UpdateAerodromeObservationService,
    SetAerodromeStatusService,
    ListAerodromesService,
    ListVisibleAerodromesService,
    ExportAerodromesService,
    FindAerodromeByIdService,
    FindVisibleAerodromeByIcaoService,
    RemoveAerodromeService,
  ],
  /** Exporta o repositório para agregação/escopo read-only pelo `DashboardModule`. */
  exports: [AerodromeRepository],
})
export class AerodromesModule {}
