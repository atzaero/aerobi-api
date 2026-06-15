import { NotificationType } from '../enums/notification-type.enum';

/**
 * Contrato de um builder de mensagem: dado o tipo, renderiza o texto a partir
 * dos `params`. Cada tipo de notificação tem exatamente um builder. O dispatch
 * resolve o builder pelo {@link NotificationMessageBuilder.type}.
 */
export interface NotificationMessageBuilder {
  readonly type: NotificationType;
  build(params: Readonly<Record<string, unknown>>): string;
}

/** Token (multi) de injeção do conjunto de builders registrados no módulo. */
export const NOTIFICATION_MESSAGE_BUILDERS = Symbol(
  'NotificationMessageBuilders',
);
