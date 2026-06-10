import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

import {
  MovementSource,
  MovementType,
  OperationalEventType,
} from '@/generated/prisma/enums';
import {
  MOVEMENT_CREATED_EVENT,
  MovementCreatedEvent,
} from '@/modules/movements/events/movement-created.event';

import {
  MOVEMENT_NON_CONFORMITY_EVENT,
  MovementNonConformityEvent,
} from '../events/movement-non-conformity.event';
import {
  FIRESTORE_DIRECTORY_PORT,
  FirestoreDirectoryPort,
} from '../ports/firestore-directory.port';
import { OperationalEventRepository } from '../repositories/operational-event.repository';

/** Janela default (horas) para casar o pouso com uma solicitação aprovada. */
const DEFAULT_MATCH_WINDOW_HOURS = 24;

/**
 * Listener de conformidade (#252).
 *
 * Reage a {@link MOVEMENT_CREATED_EVENT}: para pousos **automáticos**, procura
 * uma solicitação de aterragem aprovada correspondente via
 * {@link FirestoreDirectoryPort}. Não havendo match, registra uma
 * não-conformidade (`OperationalEvent`) e emite
 * {@link MOVEMENT_NON_CONFORMITY_EVENT} (a notificação por e-mail é #253).
 */
@Injectable()
export class ConformityListener {
  private readonly logger = new Logger(ConformityListener.name);
  private readonly windowHours: number;

  constructor(
    @Inject(FIRESTORE_DIRECTORY_PORT)
    private readonly directory: FirestoreDirectoryPort,
    private readonly operationalEventRepository: OperationalEventRepository,
    private readonly eventEmitter: EventEmitter2,
    config: ConfigService,
  ) {
    // env chega como string; parse com fallback ao default.
    const raw = config.get<string | number>('CONFORMITY_MATCH_WINDOW_HOURS');
    const parsed = Number(raw);
    this.windowHours =
      Number.isFinite(parsed) && parsed > 0
        ? parsed
        : DEFAULT_MATCH_WINDOW_HOURS;
  }

  /**
   * Trata a criação de um movimento. Erros (Firestore/port/DB) são capturados e
   * logados — **não** relançados: o handler é assíncrono e desacoplado, e no
   * MVP não há retry. Relançar só geraria um unhandled rejection sem efeito
   * útil para o fluxo de criação do movimento.
   */
  @OnEvent(MOVEMENT_CREATED_EVENT)
  async handleMovementCreated(event: MovementCreatedEvent): Promise<void> {
    // Filtro estrito: só pousos automáticos entram na regra de conformidade.
    if (
      event.operationType !== MovementType.LANDING ||
      event.source !== MovementSource.AUTOMATIC
    ) {
      return;
    }

    if (event.aerodrome == null) {
      this.logger.warn(
        `Movimento ${event.movementId} sem ICAO de aeródromo; não é possível verificar conformidade.`,
      );
      return;
    }

    try {
      const match = await this.directory.findApprovedLandingRequestMatch({
        registration: event.registration,
        aerodromeIcao: event.aerodrome,
        reference: event.readingDatetime,
        windowHours: this.windowHours,
      });

      if (match) {
        this.logger.debug(
          `Movimento ${event.movementId} conforme (solicitação ${match.id}).`,
        );
        return;
      }

      const created = await this.operationalEventRepository.create({
        type: OperationalEventType.NON_CONFORMITY_NO_LANDING_REQUEST,
        aerodrome: event.aerodrome,
        movementId: event.movementId,
        occurredAt: event.readingDatetime,
      });

      const payload: MovementNonConformityEvent = {
        operationalEventId: created.id,
        movementId: event.movementId,
        registration: event.registration,
        aerodrome: event.aerodrome,
        occurredAt: event.readingDatetime,
      };
      this.eventEmitter.emit(MOVEMENT_NON_CONFORMITY_EVENT, payload);

      this.logger.warn(
        `Não-conformidade registrada operationalEventId=${created.id} movementId=${event.movementId} registration=${event.registration} aerodrome=${event.aerodrome}.`,
      );
    } catch (err) {
      this.logger.error(
        `Falha ao verificar conformidade do movimento ${event.movementId}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }
}
