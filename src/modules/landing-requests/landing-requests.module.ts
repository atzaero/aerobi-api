import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EmailModule } from '@/common/email/email.module';
import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';
import { AnacModule } from '@/modules/anac/anac.module';
import { AuditModule } from '@/modules/audit/audit.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { RabModule } from '@/modules/rab/rab.module';
import { UsersModule } from '@/modules/users/users.module';
import { PrismaModule } from '@/prisma/prisma.module';

import { CreateLandingRequestController } from './controllers/create-landing-request.controller';
import { DecideLandingRequestController } from './controllers/decide-landing-request.controller';
import { ExportLandingRequestsController } from './controllers/export-landing-requests.controller';
import { FindLandingRequestByIdController } from './controllers/find-landing-request-by-id.controller';
import { ListLandingRequestsController } from './controllers/list-landing-requests.controller';
import { PendingCountLandingRequestsController } from './controllers/pending-count-landing-requests.controller';
import { RemoveLandingRequestController } from './controllers/remove-landing-request.controller';

import { LandingRequestRepository } from './repositories/landing-request.repository';

import { CreateLandingRequestService } from './services/create-landing-request.service';
import { DecideLandingRequestService } from './services/decide-landing-request.service';
import { ExportLandingRequestsService } from './services/export-landing-requests.service';
import { FindLandingRequestByIdService } from './services/find-landing-request-by-id.service';
import { ListLandingRequestsService } from './services/list-landing-requests.service';
import { LookupRabAircraftService } from './services/lookup-rab-aircraft.service';
import { PendingCountLandingRequestsService } from './services/pending-count-landing-requests.service';
import { RemoveLandingRequestService } from './services/remove-landing-request.service';
import { ValidatePilotLicenseService } from './services/validate-pilot-license.service';

/**
 * Solicitações de pouso. Convivem a rota **pública** (envio via `X-API-Key`,
 * valida ANAC + RAB + aeródromo aberto e envia comprovante) e as rotas de
 * **moderação interna** (list/get/decide/export/pending-count/delete, com JWT +
 * `PermissionsGuard` + escopo por grupo). Importa `AuthModule`/`UsersModule`
 * (guards + escopo), `AuditModule` (trilha), `AnacModule`/`RabModule` (validação
 * de licença/matrícula), `EmailModule` (comprovante/staff/decisão) e
 * `ConfigModule` (URL do painel).
 */
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    AuditModule,
    AnacModule,
    RabModule,
    EmailModule,
    ConfigModule,
  ],
  controllers: [
    CreateLandingRequestController,
    /**
     * `/export` e `/pending-count` devem preceder `/:id` (Express 5 não tem
     * regex no param de rota): senão `GET /landing-requests/export` (ou
     * `/pending-count`) cai no handler de busca por id. A invariante é travada
     * por `landing-requests.module.spec.ts`.
     */
    ListLandingRequestsController,
    ExportLandingRequestsController,
    PendingCountLandingRequestsController,
    FindLandingRequestByIdController,
    DecideLandingRequestController,
    RemoveLandingRequestController,
  ],
  providers: [
    AerobiApiKeyGuard,
    LandingRequestRepository,
    CreateLandingRequestService,
    DecideLandingRequestService,
    ListLandingRequestsService,
    FindLandingRequestByIdService,
    ExportLandingRequestsService,
    PendingCountLandingRequestsService,
    RemoveLandingRequestService,
    ValidatePilotLicenseService,
    LookupRabAircraftService,
  ],
  /** Exporta o repositório para agregação read-only pelo `DashboardModule`. */
  exports: [LandingRequestRepository],
})
export class LandingRequestsModule {}
