import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { getErrorMessage } from '@/common/utils/error.util';

import {
  MOVEMENT_CREATED_EVENT,
  type MovementCreatedEvent,
} from '@/modules/movements/events/movement-created.event';
import {
  MOVEMENTS_BATCH_CREATED_EVENT,
  type MovementsBatchCreatedEvent,
} from '@/modules/movements/events/movements-batch-created.event';

import {
  DIRECTORY_PORT,
  type DirectoryPort,
  type GroupContact,
} from '@/modules/conformity/ports/directory.port';

import { NotificationType } from '../enums/notification-type.enum';
import { NotificationDispatchService } from '../services/notification-dispatch.service';
import { toWhatsappNumber } from '../utils/phone.util';

/**
 * Roles do diretório que recebem a notificação de WhatsApp. O requisito atual é
 * notificar os **coordenadores** do grupo do aeródromo.
 */
const NOTIFY_ROLES = ['coordinator'];

/**
 * Listener de notificações WhatsApp de movimentos.
 *
 * Resolve, a partir do aeródromo do movimento, o grupo e os coordenadores (com
 * telefone) via {@link DirectoryPort} — a resolução é a "camada de cima", hoje
 * servida pelo Postgres (`PostgresDirectoryAdapter`, #475). Em seguida delega ao
 * {@link NotificationDispatchService} (agnóstico de canal e de origem dos
 * contactos).
 *
 * - `movement.created` avulso → uma notificação por movimento. Itens de lote
 *   (`batched`) são ignorados aqui: o lote é tratado pelo evento agregado.
 * - `movements.batch.created` → agrupa por grupo de aeródromos e despacha **um
 *   resumo por grupo** (evita flood de uma mensagem por movimento).
 *
 * Todo o corpo dos handlers fica em try/catch: falhas são logadas e **não**
 * relançadas (handlers async desacoplados; sem retry no MVP).
 */
@Injectable()
export class MovementNotificationsListener {
  private readonly logger = new Logger(MovementNotificationsListener.name);

  constructor(
    @Inject(DIRECTORY_PORT)
    private readonly directory: DirectoryPort,
    private readonly dispatch: NotificationDispatchService,
  ) {}

  @OnEvent(MOVEMENT_CREATED_EVENT)
  async handleMovementCreated(event: MovementCreatedEvent): Promise<void> {
    if (event.batched) {
      return;
    }
    try {
      if (!event.aerodrome) {
        return;
      }
      const phones = await this.resolveGroupPhones(event.aerodrome);
      if (phones.length === 0) {
        return;
      }
      await this.dispatch.dispatch({
        recipients: phones,
        type: NotificationType.MOVEMENT_CREATED,
        params: {
          registration: event.registration,
          aerodrome: event.aerodrome,
          operationType: event.operationType,
          readingDatetime: event.readingDatetime.toISOString(),
        },
      });
    } catch (err) {
      this.logger.error(
        `Falha ao notificar movimento ${event.movementId}: ${this.describe(err)}`,
      );
    }
  }

  @OnEvent(MOVEMENTS_BATCH_CREATED_EVENT)
  async handleBatchCreated(event: MovementsBatchCreatedEvent): Promise<void> {
    let byGroup: Map<string, MovementCreatedEvent[]>;
    try {
      byGroup = await this.groupMovementsByGroup(event.movements);
    } catch (err) {
      this.logger.error(
        `Falha ao agrupar lote de movimentos: ${this.describe(err)}`,
      );
      return;
    }

    /**
     * Best-effort por grupo: a falha de um grupo (ex.: timeout do diretório ao
     * resolver contactos) é isolada e logada, sem impedir os demais grupos do
     * mesmo lote de serem notificados.
     */
    for (const [groupId, movements] of byGroup) {
      try {
        const phones = await this.resolveContactPhones(groupId);
        if (phones.length === 0) {
          continue;
        }
        await this.dispatch.dispatch({
          recipients: phones,
          type: NotificationType.MOVEMENTS_BATCH_SUMMARY,
          params: {
            count: movements.length,
            items: movements.map((m) => ({
              registration: m.registration,
              aerodrome: m.aerodrome,
              operationType: m.operationType,
            })),
          },
        });
      } catch (err) {
        this.logger.error(
          `Falha ao notificar grupo ${groupId} do lote: ${this.describe(err)}`,
        );
      }
    }
  }

  /**
   * Agrupa os movimentos do lote por `groupId`, resolvendo cada aeródromo uma
   * única vez (cache aeródromo→grupo). Movimentos sem aeródromo ou sem grupo
   * resolvido são descartados (não há quem notificar).
   */
  private async groupMovementsByGroup(
    movements: MovementCreatedEvent[],
  ): Promise<Map<string, MovementCreatedEvent[]>> {
    const groupCache = new Map<string, string | null>();
    const byGroup = new Map<string, MovementCreatedEvent[]>();

    for (const movement of movements) {
      const aerodrome = movement.aerodrome;
      if (!aerodrome) {
        continue;
      }
      let groupId = groupCache.get(aerodrome);
      if (groupId === undefined) {
        const group = await this.directory.findAerodromeGroupByIcao(aerodrome);
        groupId = group?.groupId ?? null;
        groupCache.set(aerodrome, groupId);
      }
      if (!groupId) {
        continue;
      }
      const list = byGroup.get(groupId) ?? [];
      list.push(movement);
      byGroup.set(groupId, list);
    }

    return byGroup;
  }

  /** Resolve o grupo do aeródromo e devolve os telefones dos coordenadores. */
  private async resolveGroupPhones(aerodrome: string): Promise<string[]> {
    const group = await this.directory.findAerodromeGroupByIcao(aerodrome);
    // `groupId` pode vir vazio (aeródromo sem grupo no diretório); trata como
    // "sem grupo", igual ao caminho de lote (groupMovementsByGroup).
    if (!group?.groupId) {
      return [];
    }
    return this.resolveContactPhones(group.groupId);
  }

  /** Telefones (não vazios) dos contactos do grupo nas roles notificáveis. */
  private async resolveContactPhones(groupId: string): Promise<string[]> {
    const contacts = await this.directory.findGroupContacts(
      groupId,
      NOTIFY_ROLES,
    );
    return this.phonesOf(contacts);
  }

  /**
   * Telefones dos contactos **já no formato canônico do WhatsApp** (só dígitos
   * com DDI). Canonizar aqui — onde sabemos que os destinatários são telefones —
   * faz o dedupe do dispatch colapsar a mesma pessoa gravada em formatos
   * diferentes e descarta números inválidos antes do envio (em vez de falhar
   * por destinatário no client). `null` (telefone ausente/inválido) é filtrado.
   */
  private phonesOf(contacts: GroupContact[]): string[] {
    return contacts
      .map((c) => toWhatsappNumber(c.phone))
      .filter((number): number is string => number !== null);
  }

  private describe(err: unknown): string {
    return getErrorMessage(err);
  }
}
