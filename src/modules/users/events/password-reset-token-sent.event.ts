export const PASSWORD_RESET_TOKEN_SENT_EVENT = 'password-reset.token.sent';

/**
 * Payload do evento emitido quando uma solicitação de reset é registrada.
 * Listener envia o email com link. Emitido sempre que o user existe e
 * está ativo — não é emitido se o email não bate (evita enumeração),
 * mas a rota retorna 200 mesmo assim.
 */
export class PasswordResetTokenSentEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly resetTokenPlain: string,
    public readonly expiresAt: Date,
    public readonly ipAddress?: string,
  ) {}
}
