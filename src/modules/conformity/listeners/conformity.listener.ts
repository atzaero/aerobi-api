import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

import { getErrorMessage } from '@/common/utils/error.util';
import {
  ConformityStatus,
  MovementType,
  OperationalEventType,
} from '@/generated/prisma/enums';
import {
  MOVEMENT_CREATED_EVENT,
  MovementCreatedEvent,
} from '@/modules/movements/events/movement-created.event';
import { MOVEMENT_CONFORMITY_REQUESTED_EVENT } from '@/modules/movements/events/movement-conformity-requested.event';
import {
  MOVEMENT_CONFORMITY_RESOLVED_EVENT,
  MovementConformityResolvedEvent,
} from '@/modules/movements/events/movement-conformity-resolved.event';
import type { ResolvedConformityStatus } from '@/modules/movements/utils/conformity-status.util';

import {
  MOVEMENT_NON_CONFORMITY_EVENT,
  MovementNonConformityEvent,
} from '../events/movement-non-conformity.event';
import { DIRECTORY_PORT, DirectoryPort } from '../ports/directory.port';
import { OperationalEventRepository } from '../repositories/operational-event.repository';

/** Janela default (horas) para casar o pouso com uma solicitação aprovada. */
const DEFAULT_MATCH_WINDOW_HOURS = 24;

/** Tipo de não-conformidade tratado por este listener. */
const NON_CONFORMITY_TYPE =
  OperationalEventType.NON_CONFORMITY_NO_LANDING_REQUEST;

/**
 * Listener de conformidade (#252).
 *
 * Reage a {@link MOVEMENT_CREATED_EVENT} e a
 * {@link MOVEMENT_CONFORMITY_REQUESTED_EVENT} (reavaliação após edição). Para
 * **pousos com aeródromo conhecido** (de qualquer origem — AUTOMATIC ou MANUAL),
 * procura uma solicitação de aterragem aprovada via {@link DirectoryPort}
 * e resolve a conformidade do movimento emitindo
 * {@link MOVEMENT_CONFORMITY_RESOLVED_EVENT} (o módulo `movements` persiste o
 * status). Não havendo match, registra uma não-conformidade (`OperationalEvent`,
 * deduplicada por movimento) e emite {@link MOVEMENT_NON_CONFORMITY_EVENT} para a
 * notificação por e-mail. Havendo match, resolve qualquer não-conformidade
 * anterior em aberto (caso de reavaliação).
 */
@Injectable()
export class ConformityListener {
  private readonly logger = new Logger(ConformityListener.name);
  private readonly windowHours: number;

  constructor(
    @Inject(DIRECTORY_PORT)
    private readonly directory: DirectoryPort,
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

  /** Avalia a conformidade na criação do movimento. */
  @OnEvent(MOVEMENT_CREATED_EVENT)
  async handleMovementCreated(event: MovementCreatedEvent): Promise<void> {
    await this.evaluate(event);
  }

  /** Reavalia a conformidade de um movimento existente (ex.: matrícula corrigida). */
  @OnEvent(MOVEMENT_CONFORMITY_REQUESTED_EVENT)
  async handleConformityRequested(event: MovementCreatedEvent): Promise<void> {
    await this.evaluate(event);
  }

  /**
   * Núcleo da avaliação. Erros (Firestore/port/DB) são capturados e logados —
   * **não** relançados: o handler é assíncrono e desacoplado, e no MVP não há
   * retry. Relançar só geraria um unhandled rejection sem efeito útil para o
   * fluxo de criação/edição do movimento.
   */
  private async evaluate(event: MovementCreatedEvent): Promise<void> {
    // Filtro: só pousos com aeródromo conhecido entram na regra (AUTOMATIC ou
    // MANUAL). Decolagens e movimentos sem ICAO já nascem `NOT_APPLICABLE` na
    // criação, então não há nada a fazer aqui.
    if (event.operationType !== MovementType.LANDING) {
      return;
    }
    if (event.aerodrome == null) {
      this.logger.warn(
        `Movimento ${event.movementId} sem ICAO de aeródromo; não é possível verificar conformidade.`,
      );
      return;
    }
    const aerodrome = event.aerodrome;

    try {
      const match = await this.directory.findApprovedLandingRequestMatch({
        registration: event.registration,
        aerodromeIcao: aerodrome,
        reference: event.readingDatetime,
        windowHours: this.windowHours,
      });

      if (match) {
        await this.handleConformant(event, match.id);
        return;
      }

      await this.handleNonConformant(event, aerodrome);
    } catch (err) {
      this.logger.error(
        `Falha ao verificar conformidade do movimento ${event.movementId}: ${getErrorMessage(
          err,
        )}`,
      );
    }
  }

  /**
   * Movimento conforme: resolve qualquer não-conformidade anterior em aberto
   * (relevante na reavaliação) e persiste `CONFORMANT` via evento.
   */
  private async handleConformant(
    event: MovementCreatedEvent,
    matchId: string,
  ): Promise<void> {
    await this.operationalEventRepository.resolveOpenByMovement(
      event.movementId,
      NON_CONFORMITY_TYPE,
    );
    this.emitResolved(event.movementId, ConformityStatus.CONFORMANT);
    this.logger.debug(
      `Movimento ${event.movementId} conforme (solicitação ${matchId}).`,
    );
  }

  /**
   * Movimento não conforme. Registra a não-conformidade (deduplicada — não cria
   * duplicada se já houver uma em aberto para o movimento) e, em ambos os
   * caminhos, persiste `NON_CONFORMANT` via {@link MOVEMENT_CONFORMITY_RESOLVED_EVENT}.
   *
   * O status só é resolvido **depois** de garantida a existência do
   * `OperationalEvent` (o existente, ou o recém-criado): assim, se o `create`
   * falhar, o movimento não fica marcado não conforme sem o evento que o
   * justifica. O e-mail (`MOVEMENT_NON_CONFORMITY_EVENT`) só é disparado quando a
   * não-conformidade é criada agora.
   */
  private async handleNonConformant(
    event: MovementCreatedEvent,
    aerodrome: string,
  ): Promise<void> {
    const existing = await this.operationalEventRepository.findOpenByMovement(
      event.movementId,
      NON_CONFORMITY_TYPE,
    );

    if (existing) {
      this.emitResolved(event.movementId, ConformityStatus.NON_CONFORMANT);
      this.logger.debug(
        `Movimento ${event.movementId} segue não conforme (operationalEventId=${existing.id} já em aberto).`,
      );
      return;
    }

    const created = await this.operationalEventRepository.create({
      type: NON_CONFORMITY_TYPE,
      aerodrome,
      movementId: event.movementId,
      occurredAt: event.readingDatetime,
    });

    this.emitResolved(event.movementId, ConformityStatus.NON_CONFORMANT);

    const payload: MovementNonConformityEvent = {
      operationalEventId: created.id,
      movementId: event.movementId,
      registration: event.registration,
      aerodrome,
      occurredAt: event.readingDatetime,
    };
    this.eventEmitter.emit(MOVEMENT_NON_CONFORMITY_EVENT, payload);

    this.logger.warn(
      `Não-conformidade registrada operationalEventId=${created.id} movementId=${event.movementId} registration=${event.registration} aerodrome=${aerodrome}.`,
    );
  }

  /** Emite a resolução da conformidade para o módulo `movements` persistir. */
  private emitResolved(
    movementId: string,
    status: ResolvedConformityStatus,
  ): void {
    const payload: MovementConformityResolvedEvent = { movementId, status };
    this.eventEmitter.emit(MOVEMENT_CONFORMITY_RESOLVED_EVENT, payload);
  }
}
