/**
 * Port (interface) de um cliente de envio de WhatsApp.
 *
 * Os consumidores (dispatch/listeners) dependem **apenas** deste contrato e do
 * token de injeção {@link WHATSAPP_CLIENT}; nenhum detalhe do gateway concreto
 * (Evolution GO: endpoints, header de auth, formato de payload) vaza para fora
 * do adapter. Trocar o gateway = trocar só o adapter.
 */

/** Entrada de um envio de texto: destinatário cru (será normalizado) + corpo. */
export interface WhatsappSendTextInput {
  /** Telefone do destinatário em formato cru (ex.: `User.phone`). */
  readonly to: string;
  /** Texto da mensagem (já renderizado pelo message builder). */
  readonly text: string;
}

/** Resultado de um envio bem-sucedido. */
export interface WhatsappSendResult {
  /** Número canônico (só dígitos) para o qual foi enviado. */
  readonly to: string;
  /** Identificador da mensagem no gateway, quando devolvido. */
  readonly messageId: string | null;
}

export interface WhatsappClient {
  /**
   * Envia uma mensagem de texto. Lança {@link WhatsappSendError} em falha
   * (com `retryable` indicando se vale a pena reenviar mais tarde).
   */
  sendText(input: WhatsappSendTextInput): Promise<WhatsappSendResult>;
}

/** Token de injeção do port. */
export const WHATSAPP_CLIENT = Symbol('WhatsappClient');
