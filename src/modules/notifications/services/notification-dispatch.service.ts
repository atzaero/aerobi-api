import { Inject, Injectable, Logger } from '@nestjs/common';

import { getErrorMessage } from '@/common/utils/error.util';

import {
  NOTIFICATION_MESSAGE_BUILDERS,
  NotificationMessageBuilder,
} from '../builders/notification-message.builder';
import {
  WHATSAPP_CLIENT,
  WhatsappClient,
} from '../clients/whatsapp-client.port';
import { WhatsappSendError } from '../clients/whatsapp-send.error';
import { NotificationType } from '../enums/notification-type.enum';
import {
  NotificationDispatchCommand,
  NotificationDispatchResult,
  NotificationDispatchResultItem,
} from '../types/notification-dispatch.types';

/**
 * Serviço de disparo de notificações — genérico e desacoplado.
 *
 * Recebe a lista de destinatários (a resolução de quem recebe é feita pela
 * camada de cima), o tipo da mensagem e os `params` do tipo. Resolve o
 * {@link NotificationMessageBuilder} do tipo, renderiza o texto uma vez e
 * dispara para todos os destinatários pelo canal WhatsApp. É tolerante a falha
 * por destinatário: uma falha não derruba o lote — é registrada no resultado e
 * logada. Não lança em falha de envio (best-effort); só lança se o tipo não tem
 * builder (erro de programação).
 */
@Injectable()
export class NotificationDispatchService {
  private readonly logger = new Logger(NotificationDispatchService.name);
  private readonly builders: Map<NotificationType, NotificationMessageBuilder>;

  constructor(
    @Inject(WHATSAPP_CLIENT) private readonly whatsapp: WhatsappClient,
    @Inject(NOTIFICATION_MESSAGE_BUILDERS)
    builders: NotificationMessageBuilder[],
  ) {
    this.builders = new Map(builders.map((b) => [b.type, b]));
  }

  async dispatch(
    command: NotificationDispatchCommand,
  ): Promise<NotificationDispatchResult> {
    const builder = this.builders.get(command.type);
    if (!builder) {
      throw new Error(
        `Nenhum message builder registrado para o tipo "${command.type}"`,
      );
    }

    const recipients = this.dedupe(command.recipients);
    if (recipients.length === 0) {
      return this.emptyResult(command.type);
    }

    const text = builder.build(command.params);

    const items = await Promise.all(
      recipients.map((to) => this.sendOne(to, text)),
    );

    const result: NotificationDispatchResult = {
      type: command.type,
      sent: items.filter((i) => i.status === 'sent').length,
      failed: items.filter((i) => i.status === 'failed').length,
      skipped: items.filter((i) => i.status === 'skipped').length,
      items,
    };

    this.logger.log(
      `Dispatch ${command.type}: enviados=${result.sent} falhas=${result.failed} ignorados=${result.skipped} (destinatários=${recipients.length}).`,
    );
    return result;
  }

  /** Envia para um destinatário, convertendo falha em item de resultado. */
  private async sendOne(
    to: string,
    text: string,
  ): Promise<NotificationDispatchResultItem> {
    try {
      const sent = await this.whatsapp.sendText({ to, text });
      return { to: sent.to, status: 'sent', messageId: sent.messageId };
    } catch (err) {
      const message = getErrorMessage(err);
      if (err instanceof WhatsappSendError) {
        this.logger.warn(
          `Falha ao enviar WhatsApp (retryable=${err.retryable}) para "${to}": ${message}`,
        );
      } else {
        /**
         * Erro não esperado de um envio (ex.: `ServiceUnavailableException` por
         * `EVOLUTION_GO_*` ausente) é misconfiguração global, não falha de
         * entrega: sinaliza em `error` para não se diluir como ruído transitório
         * por destinatário.
         */
        this.logger.error(
          `Erro inesperado ao enviar WhatsApp para "${to}" (possível misconfiguração): ${message}`,
        );
      }
      return { to, status: 'failed', error: message };
    }
  }

  /** Remove vazios e duplicados preservando a ordem de chegada. */
  private dedupe(recipients: readonly string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const raw of recipients) {
      const value = raw?.trim();
      if (!value || seen.has(value)) continue;
      seen.add(value);
      out.push(value);
    }
    return out;
  }

  private emptyResult(type: NotificationType): NotificationDispatchResult {
    return { type, sent: 0, failed: 0, skipped: 0, items: [] };
  }
}
