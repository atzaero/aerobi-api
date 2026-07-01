import { Module } from '@nestjs/common';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { PrismaModule } from '@/prisma/prisma.module';

import { CreateAerodromeFeedbackController } from './controllers/create-aerodrome-feedback.controller';
import { ExportAerodromeFeedbacksController } from './controllers/export-aerodrome-feedbacks.controller';
import { FindAerodromeFeedbackByIdController } from './controllers/find-aerodrome-feedback-by-id.controller';
import { ListAerodromeFeedbacksController } from './controllers/list-aerodrome-feedbacks.controller';
import { RemoveAerodromeFeedbackController } from './controllers/remove-aerodrome-feedback.controller';
import { SummaryAerodromeFeedbacksController } from './controllers/summary-aerodrome-feedbacks.controller';

import { AerodromeFeedbackRepository } from './repositories/aerodrome-feedback.repository';

import { CreateAerodromeFeedbackService } from './services/create-aerodrome-feedback.service';
import { ExportAerodromeFeedbacksService } from './services/export-aerodrome-feedbacks.service';
import { FindAerodromeFeedbackByIdService } from './services/find-aerodrome-feedback-by-id.service';
import { ListAerodromeFeedbacksService } from './services/list-aerodrome-feedbacks.service';
import { RemoveAerodromeFeedbackService } from './services/remove-aerodrome-feedback.service';
import { SummaryAerodromeFeedbacksService } from './services/summary-aerodrome-feedbacks.service';

/**
 * Módulo de avaliações públicas de aeródromo. Convivem rotas **públicas** (envio
 * anônimo + resumo, só `X-API-Key`) e rotas de **moderação interna** (list/get/
 * delete/export, com JWT + `PermissionsGuard` + escopo por grupo). Importa
 * `AuthModule` (guards JWT/permissões/escopo) e `UsersModule` (`UserRepository`,
 * lookup do escopo de grupo do ator nos services de list/export).
 */
@Module({
  imports: [PrismaModule, AuthModule, UsersModule],
  controllers: [
    CreateAerodromeFeedbackController,
    /**
     * `/summary` e `/export` devem preceder `/:id` (Express 5 não tem regex no
     * param de rota): senão `GET /aerodrome-feedbacks/summary` (ou `/export`) cai
     * no handler de busca por id. A invariante é travada por
     * `aerodrome-feedbacks.module.spec.ts`.
     */
    SummaryAerodromeFeedbacksController,
    ListAerodromeFeedbacksController,
    ExportAerodromeFeedbacksController,
    FindAerodromeFeedbackByIdController,
    RemoveAerodromeFeedbackController,
  ],
  providers: [
    AerobiApiKeyGuard,
    AerodromeFeedbackRepository,
    CreateAerodromeFeedbackService,
    SummaryAerodromeFeedbacksService,
    ListAerodromeFeedbacksService,
    ExportAerodromeFeedbacksService,
    FindAerodromeFeedbackByIdService,
    RemoveAerodromeFeedbackService,
  ],
})
export class AerodromeFeedbacksModule {}
