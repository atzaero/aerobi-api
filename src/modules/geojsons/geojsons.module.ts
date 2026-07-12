import { Module } from '@nestjs/common';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';
import { AuditModule } from '@/modules/audit/audit.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { PrismaModule } from '@/prisma/prisma.module';

import { FindGeojsonByIdController } from './controllers/find-geojson-by-id.controller';
import { FindGeojsonForAerodromeController } from './controllers/find-geojson-for-aerodrome.controller';
import { FindVisibleGeojsonByAerodromeIdController } from './controllers/find-visible-geojson-by-aerodrome-id.controller';
import { GenerateGeojsonController } from './controllers/generate-geojson.controller';
import { ListGeojsonsController } from './controllers/list-geojsons.controller';
import { ListVisibleGeojsonsController } from './controllers/list-visible-geojsons.controller';
import { RemoveGeojsonController } from './controllers/remove-geojson.controller';

import { GeojsonRepository } from './repositories/geojson.repository';

import { FindGeojsonByIdService } from './services/find-geojson-by-id.service';
import { FindGeojsonForAerodromeService } from './services/find-geojson-for-aerodrome.service';
import { FindVisibleGeojsonByAerodromeIdService } from './services/find-visible-geojson-by-aerodrome-id.service';
import { GenerateGeojsonService } from './services/generate-geojson.service';
import { ListGeojsonsService } from './services/list-geojsons.service';
import { ListVisibleGeojsonsService } from './services/list-visible-geojsons.service';
import { RemoveGeojsonService } from './services/remove-geojson.service';

/**
 * GeoJSON operacional dos aeródromos (Firebase → API, #376). Recurso
 * **read-mostly derivado**: leitura por aeródromo (paridade com o web) + geração
 * KML/KMZ→GeoJSON best-effort (upsert 1:1). Cutover para JWT + `PermissionsGuard`
 * (reusa o subject RBAC `aerodrome`) + escopo por grupo (`GroupScopeGuard`).
 * Rotas públicas `/visible` usam `AerobiApiKeyGuard` (#545). Importa
 * `AuthModule`/`UsersModule` (guards + escopo) e `AuditModule` (trilha);
 * exporta `GenerateGeojsonService` para o `documents` (#366) disparar no upload.
 */
@Module({
  imports: [PrismaModule, AuthModule, UsersModule, AuditModule],
  controllers: [
    /**
     * Rotas fixas (`/aerodrome/...`, `/visible`, `/visible/:aerodromeId`)
     * precedem `/:id` no registro. Em Express 5 (path-to-regexp 8) a
     * precedência depende da ordem dos controllers — a invariante é travada
     * por `geojsons.module.spec.ts`.
     */
    ListGeojsonsController,
    ListVisibleGeojsonsController,
    FindVisibleGeojsonByAerodromeIdController,
    FindGeojsonForAerodromeController,
    GenerateGeojsonController,
    FindGeojsonByIdController,
    RemoveGeojsonController,
  ],
  providers: [
    AerobiApiKeyGuard,
    GeojsonRepository,
    ListGeojsonsService,
    ListVisibleGeojsonsService,
    FindVisibleGeojsonByAerodromeIdService,
    FindGeojsonForAerodromeService,
    GenerateGeojsonService,
    FindGeojsonByIdService,
    RemoveGeojsonService,
  ],
  exports: [GenerateGeojsonService],
})
export class GeojsonsModule {}
