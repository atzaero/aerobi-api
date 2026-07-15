import { NotificationType } from '../enums/notification-type.enum';

/**
 * Tipos do contrato de disparo de notificações.
 *
 * O {@link NotificationDispatchCommand} é o que a camada de cima (listeners)
 * monta: a lista de telefones que recebem a mensagem, o tipo da mensagem e os
 * `params` que variam por tipo. O serviço de disparo é agnóstico da origem dos
 * destinatários (Firebase hoje, Postgres no futuro) e do canal (WhatsApp hoje).
 */

/** Comando de disparo: destinatários (telefones crus) + tipo + params do tipo. */
export interface NotificationDispatchCommand {
  readonly recipients: readonly string[];
  readonly type: NotificationType;
  readonly params: Readonly<Record<string, unknown>>;
}

/** Resultado por destinatário. */
export interface NotificationDispatchResultItem {
  readonly to: string;
  readonly status: 'sent' | 'failed' | 'skipped';
  readonly messageId?: string | null;
  readonly error?: string;
}

/** Resultado agregado do disparo de um comando. */
export interface NotificationDispatchResult {
  readonly type: NotificationType;
  readonly sent: number;
  readonly failed: number;
  readonly skipped: number;
  readonly items: NotificationDispatchResultItem[];
}
