/**
 * Erro de envio de WhatsApp.
 *
 * Carrega a flag {@link WhatsappSendError.retryable} para o caller decidir se
 * vale reenviar (falhas de rede, 429 e 5xx do gateway são retryable; 4xx de
 * cliente — número inválido, instância inexistente, auth — não são). No MVP não
 * há fila/retry: o dispatch apenas loga e segue, mas a classificação fica
 * pronta para quando houver.
 */
export class WhatsappSendError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'WhatsappSendError';
  }
}
