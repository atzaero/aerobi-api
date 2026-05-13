export const PASSWORD_RESET_SUCCEEDED_EVENT = 'password-reset.succeeded';

/**
 * Emitido após o usuário concluir o fluxo de reset. Útil para audit,
 * notificação de mudança de senha (PR futuro com template
 * `password_changed`), e métricas.
 */
export class PasswordResetSucceededEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly revokedRefreshCount: number,
  ) {}
}
