export const USER_EMAIL_CHANGED_EVENT = 'user.email.changed';

/**
 * Emitido quando um administrador altera o email de um usuário. O listener
 * notifica **ambos** os endereços (o antigo, como alerta de segurança, e o
 * novo, como confirmação) de forma best-effort. Espelha
 * `_shared/send-email-changed-notification.ts` do `aerobi-web`.
 */
export class UserEmailChangedEvent {
  constructor(
    public readonly userId: string,
    public readonly name: string,
    public readonly oldEmail: string,
    public readonly newEmail: string,
  ) {}
}
