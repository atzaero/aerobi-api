import { Module } from '@nestjs/common';

import { AuditModule } from '@/modules/audit/audit.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { PrismaModule } from '@/prisma/prisma.module';

import { FindGeojsonByIdController } from './controllers/find-geojson-by-id.controller';
import { FindGeojsonForAerodromeController } from './controllers/find-geojson-for-aerodrome.controller';
import { GenerateGeojsonController } from './controllers/generate-geojson.controller';
import { ListGeojsonsController } from './controllers/list-geojsons.controller';
import { RemoveGeojsonController } from './controllers/remove-geojson.controller';

import { GeojsonRepository } from './repositories/geojson.repository';

import { FindGeojsonByIdService } from './services/find-geojson-by-id.service';
import { FindGeojsonForAerodromeService } from './services/find-geojson-for-aerodrome.service';
import { GenerateGeojsonService } from './services/generate-geojson.service';
import { ListGeojsonsService } from './services/list-geojsons.service';
import { RemoveGeojsonService } from './services/remove-geojson.service';

/**
 * GeoJSON operacional dos aeródromos (Firebase → API, #376). Recurso
 * **read-mostly derivado**: leitura por aeródromo (paridade com o web) + geração
 * KML/KMZ→GeoJSON best-effort (upsert 1:1). Cutover para JWT + `PermissionsGuard`
 * (reusa o subject RBAC `aerodrome`) + escopo por grupo (`GroupScopeGuard`).
 * Importa `AuthModule`/`UsersModule` (guards + escopo) e `AuditModule` (trilha);
 * exporta `GenerateGeojsonService` para o `documents` (#366) disparar no upload.
 * Camada pública do mapa vive em `GET /aerodromes/visible*` (#546), que aninha
 * o GeoJSON no aeródromo. As rotas `GET /geojsons/visible*` foram removidas —
 * consumidores devem migrar em cutover atômico com o aerobi-web (#1116).
 */
@Module({
  imports: [PrismaModule, AuthModule, UsersModule, AuditModule],
  controllers: [
    /**
     * Rotas fixas (`/aerodrome/...`) precedem `/:id` no registro. Em Express 5
     * (path-to-regexp 8) a precedência depende da ordem dos controllers — a
     * invariante é travada por `geojsons.module.spec.ts`.
     */
    ListGeojsonsController,
    FindGeojsonForAerodromeController,
    GenerateGeojsonController,
    FindGeojsonByIdController,
    RemoveGeojsonController,
  ],
  providers: [
    GeojsonRepository,
    ListGeojsonsService,
    FindGeojsonForAerodromeService,
    GenerateGeojsonService,
    FindGeojsonByIdService,
    RemoveGeojsonService,
  ],
  exports: [GenerateGeojsonService],
})
export class GeojsonsModule {}
