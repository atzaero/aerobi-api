import { Module } from '@nestjs/common';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { PrismaModule } from '@/prisma/prisma.module';

import { CreateFeedbackController } from './controllers/create-feedback.controller';
import { ExportFeedbacksController } from './controllers/export-feedbacks.controller';
import { FindFeedbackByIdController } from './controllers/find-feedback-by-id.controller';
import { ListFeedbacksController } from './controllers/list-feedbacks.controller';
import { RemoveFeedbackController } from './controllers/remove-feedback.controller';
import { SummaryFeedbacksController } from './controllers/summary-feedbacks.controller';

import { FeedbackRepository } from './repositories/feedback.repository';

import { CreateFeedbackService } from './services/create-feedback.service';
import { ExportFeedbacksService } from './services/export-feedbacks.service';
import { FindFeedbackByIdService } from './services/find-feedback-by-id.service';
import { ListFeedbacksService } from './services/list-feedbacks.service';
import { RemoveFeedbackService } from './services/remove-feedback.service';
import { SummaryFeedbacksService } from './services/summary-feedbacks.service';

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
    CreateFeedbackController,
    /**
     * `/summary` e `/export` devem preceder `/:id` (Express 5 não tem regex no
     * param de rota): senão `GET /feedbacks/summary` (ou `/export`) cai
     * no handler de busca por id. A invariante é travada por
     * `feedbacks.module.spec.ts`.
     */
    SummaryFeedbacksController,
    ListFeedbacksController,
    ExportFeedbacksController,
    FindFeedbackByIdController,
    RemoveFeedbackController,
  ],
  providers: [
    AerobiApiKeyGuard,
    FeedbackRepository,
    CreateFeedbackService,
    SummaryFeedbacksService,
    ListFeedbacksService,
    ExportFeedbacksService,
    FindFeedbackByIdService,
    RemoveFeedbackService,
  ],
  /** Exporta o repositório para agregação read-only pelo `DashboardModule`. */
  exports: [FeedbackRepository],
})
export class FeedbacksModule {}
