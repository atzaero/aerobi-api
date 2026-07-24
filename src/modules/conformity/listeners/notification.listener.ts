import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';

import { EmailService } from '@/common/email/email.service';
import { formatEmailDate } from '@/common/email/utils/format-email-date.util';
import { getErrorMessage } from '@/common/utils/error.util';

import {
  MOVEMENT_NON_CONFORMITY_EVENT,
  MovementNonConformityEvent,
} from '../events/movement-non-conformity.event';
import { DIRECTORY_PORT, DirectoryPort } from '../ports/directory.port';
import { OperationalEventRepository } from '../repositories/operational-event.repository';

/** Janela default (minutos) para deduplicar notificações de não-conformidade. */
const DEFAULT_DEDUPE_MINUTES = 30;

/** Roles (minúsculas) do diretório que recebem a notificação. */
const NOTIFY_ROLES = ['coordinator', 'operator'];

/**
 * Listener de notificação de conformidade (#253).
 *
 * Reage a {@link MOVEMENT_NON_CONFORMITY_EVENT}: resolve o grupo do aeródromo e
 * os contactos (coordenadores/operadores) via {@link DirectoryPort} e
 * envia um e-mail. Faz dedupe por matrícula+aeródromo numa janela configurável
 * (`CONFORMITY_NOTIFY_DEDUPE_MINUTES`, default {@link DEFAULT_DEDUPE_MINUTES}),
 * marcando a não-conformidade como notificada (`notifiedAt`) após o envio.
 */
@Injectable()
export class NotificationListener {
  private readonly logger = new Logger(NotificationListener.name);
  private readonly dedupeMinutes: number;

  constructor(
    @Inject(DIRECTORY_PORT)
    private readonly directory: DirectoryPort,
    private readonly operationalEventRepository: OperationalEventRepository,
    private readonly emailService: EmailService,
    config: ConfigService,
  ) {
    // env chega como string; parse com fallback ao default.
    const raw = config.get<string | number>('CONFORMITY_NOTIFY_DEDUPE_MINUTES');
    const parsed = Number(raw);
    this.dedupeMinutes =
      Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_DEDUPE_MINUTES;
  }

  /**
   * Notifica os contactos do aeródromo sobre a não-conformidade. Todo o corpo
   * está em try/catch: erros (port/email/DB) são logados e **não** relançados —
   * o handler é assíncrono e desacoplado, e no MVP não há retry.
   */
  @OnEvent(MOVEMENT_NON_CONFORMITY_EVENT)
  async handle(event: MovementNonConformityEvent): Promise<void> {
    try {
      // Dedupe primeiro: evita reconsultar o diretório e reenviar e-mail.
      const since = new Date(Date.now() - this.dedupeMinutes * 60000);
      const recent = await this.operationalEventRepository.findRecentNotified({
        aerodrome: event.aerodrome,
        registration: event.registration,
        since,
      });
      if (recent) {
        this.logger.log(
          `Não-conformidade já notificada recentemente (dedupe) aerodrome=${event.aerodrome} registration=${event.registration}; ignorando operationalEventId=${event.operationalEventId}.`,
        );
        return;
      }

      const group = await this.directory.findAerodromeGroupByIcao(
        event.aerodrome,
      );
      if (!group) {
        this.logger.log(
          `Sem grupo para o aeródromo ${event.aerodrome}; não há quem notificar (operationalEventId=${event.operationalEventId}).`,
        );
        return;
      }

      const contacts = await this.directory.findGroupContacts(
        group.groupId,
        NOTIFY_ROLES,
      );
      if (contacts.length === 0) {
        this.logger.log(
          `Grupo ${group.groupId} sem contactos (${NOTIFY_ROLES.join(', ')}) para o aeródromo ${event.aerodrome}; nada a notificar.`,
        );
        return;
      }

      await this.emailService.send({
        to: contacts.map((c) => c.email),
        subject: `Pouso sem solicitação em ${event.aerodrome}`,
        template: 'landing_non_conformity',
        variables: {
          AERODROME: event.aerodrome,
          REGISTRATION: event.registration,
          OCCURRED_AT: formatEmailDate(event.occurredAt),
        },
      });

      await this.operationalEventRepository.markNotified(
        event.operationalEventId,
        new Date(),
      );

      this.logger.log(
        `Notificação de não-conformidade enviada operationalEventId=${event.operationalEventId} aerodrome=${event.aerodrome} registration=${event.registration} destinatários=${contacts.length}.`,
      );
    } catch (err) {
      this.logger.error(
        `Falha ao notificar não-conformidade operationalEventId=${event.operationalEventId}: ${getErrorMessage(
          err,
        )}`,
      );
    }
  }
}
