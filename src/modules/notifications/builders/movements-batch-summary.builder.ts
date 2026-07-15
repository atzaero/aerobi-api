import { Injectable } from '@nestjs/common';

import { NotificationType } from '../enums/notification-type.enum';
import { movementTypeLabel } from '../utils/movement-label.util';
import { readArray, readNumber, readString } from '../utils/params.util';
import { NotificationMessageBuilder } from './notification-message.builder';

/** Máximo de itens listados no corpo antes de resumir o excedente. */
const MAX_LISTED_ITEMS = 10;

/** Item de movimento no resumo do lote. */
interface BatchSummaryItem {
  registration?: unknown;
  aerodrome?: unknown;
  operationType?: unknown;
}

/**
 * Builder do texto de {@link NotificationType.MOVEMENTS_BATCH_SUMMARY}.
 *
 * Params esperados: `groupName` (opcional), `count` (total do lote para o grupo)
 * e `items` (lista `{ registration, aerodrome, operationType }`). Lista até
 * {@link MAX_LISTED_ITEMS} e resume o excedente para não estourar a mensagem.
 */
@Injectable()
export class MovementsBatchSummaryMessageBuilder implements NotificationMessageBuilder {
  readonly type = NotificationType.MOVEMENTS_BATCH_SUMMARY;

  build(params: Readonly<Record<string, unknown>>): string {
    const groupName = readString(params, 'groupName');
    const items = readArray<BatchSummaryItem>(params, 'items');
    const count = readNumber(params, 'count', items.length);

    const header = groupName
      ? `📋 Aerobi — ${count} movimento(s) registrado(s) — ${groupName}`
      : `📋 Aerobi — ${count} movimento(s) registrado(s)`;

    const listed = items.slice(0, MAX_LISTED_ITEMS).map((item) => {
      const registration =
        typeof item.registration === 'string' ? item.registration : 'aeronave';
      const aerodrome =
        typeof item.aerodrome === 'string' ? item.aerodrome : '—';
      const operation = movementTypeLabel(
        typeof item.operationType === 'string' ? item.operationType : '',
      );
      return `• ${registration} — ${operation} em ${aerodrome}`;
    });

    const remaining = items.length - listed.length;
    const lines = [header, ...listed];
    if (remaining > 0) {
      lines.push(`…e mais ${remaining}`);
    }
    return lines.join('\n');
  }
}
