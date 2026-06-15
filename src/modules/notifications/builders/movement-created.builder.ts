import { Injectable } from '@nestjs/common';

import { NotificationType } from '../enums/notification-type.enum';
import { formatBrDateTime } from '../utils/format-datetime.util';
import { movementTypeLabel } from '../utils/movement-label.util';
import { readString } from '../utils/params.util';
import { NotificationMessageBuilder } from './notification-message.builder';

/**
 * Builder do texto de {@link NotificationType.MOVEMENT_CREATED}.
 *
 * Params esperados: `registration`, `aerodrome`, `operationType` (valor de
 * `MovementType`) e `readingDatetime` (ISO 8601).
 */
@Injectable()
export class MovementCreatedMessageBuilder implements NotificationMessageBuilder {
  readonly type = NotificationType.MOVEMENT_CREATED;

  build(params: Readonly<Record<string, unknown>>): string {
    const registration = readString(params, 'registration', 'aeronave');
    const aerodrome = readString(
      params,
      'aerodrome',
      'aeródromo não informado',
    );
    const operation = movementTypeLabel(readString(params, 'operationType'));
    const when = formatBrDateTime(readString(params, 'readingDatetime'));

    const whenSuffix = when ? ` em ${when}` : '';
    return (
      `🛬 Aerobi — novo ${operation} registrado\n` +
      `Aeronave: ${registration}\n` +
      `Aeródromo: ${aerodrome}${whenSuffix}`
    );
  }
}
