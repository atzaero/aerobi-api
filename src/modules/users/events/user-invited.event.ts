import type { UserRole } from '@/generated/prisma/client';

/** Nome do evento (usado por `@OnEvent`). */
export const USER_INVITED_EVENT = 'user.invited';

/**
 * Payload do evento emitido quando um ADMIN cria um User pendente e gera
 * Token tipo INVITE. O listener envia o email de convite.
 */
export class UserInvitedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly role: UserRole,
    public readonly inviteTokenPlain: string,
    public readonly expiresAt: Date,
    public readonly invitedByName?: string,
  ) {}
}
