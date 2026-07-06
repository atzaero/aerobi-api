import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { ConformityModule } from '@/modules/conformity/conformity.module';

import { MovementCreatedMessageBuilder } from './builders/movement-created.builder';
import { MovementsBatchSummaryMessageBuilder } from './builders/movements-batch-summary.builder';
import {
  NOTIFICATION_MESSAGE_BUILDERS,
  NotificationMessageBuilder,
} from './builders/notification-message.builder';
import { EvolutionGoClient } from './clients/evolution-go.client';
import { WHATSAPP_CLIENT } from './clients/whatsapp-client.port';
import { MovementNotificationsListener } from './listeners/movement-notifications.listener';
import { NotificationDispatchService } from './services/notification-dispatch.service';

/**
 * Módulo de notificações (#304).
 *
 * Despacha notificações (hoje WhatsApp via Evolution GO) de forma desacoplada:
 * o {@link NotificationDispatchService} recebe destinatários prontos + tipo +
 * params e delega ao {@link WHATSAPP_CLIENT}; cada tipo tem um message builder
 * registrado em {@link NOTIFICATION_MESSAGE_BUILDERS}. O
 * {@link MovementNotificationsListener} reage a `movement.created` /
 * `movements.batch.created`, resolve os coordenadores do grupo via
 * {@link ConformityModule} (port do diretório, sobre Postgres — #475) e dispara.
 *
 * **Environment (Aerobi → Evolution GO):** `EVOLUTION_GO_BASE_URL` (base interna
 * na warpgate, ex.: `http://evolution_go:4000`), `EVOLUTION_GO_API_KEY` (token da
 * instância), `EVOLUTION_GO_AUTH_HEADER` (default `apikey`),
 * `EVOLUTION_GO_HTTP_TIMEOUT_MS` (default `8000`).
 */
@Module({
  imports: [
    ConformityModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const raw = config.get<string | number>(
          'EVOLUTION_GO_HTTP_TIMEOUT_MS',
          8000,
        );
        const parsed =
          typeof raw === 'number' ? raw : parseInt(String(raw), 10);
        const timeoutMs = Number.isFinite(parsed) && parsed > 0 ? parsed : 8000;
        return {
          timeout: timeoutMs,
          maxRedirects: 5,
          headers: { 'Content-Type': 'application/json' },
        };
      },
    }),
  ],
  providers: [
    { provide: WHATSAPP_CLIENT, useClass: EvolutionGoClient },
    MovementCreatedMessageBuilder,
    MovementsBatchSummaryMessageBuilder,
    {
      provide: NOTIFICATION_MESSAGE_BUILDERS,
      useFactory: (
        movementCreated: MovementCreatedMessageBuilder,
        batchSummary: MovementsBatchSummaryMessageBuilder,
      ): NotificationMessageBuilder[] => [movementCreated, batchSummary],
      inject: [
        MovementCreatedMessageBuilder,
        MovementsBatchSummaryMessageBuilder,
      ],
    },
    NotificationDispatchService,
    MovementNotificationsListener,
  ],
  exports: [NotificationDispatchService],
})
export class NotificationsModule {}
