import type { ContactType } from '@/generated/prisma/client';

/** Nome do evento (usado por `@OnEvent`). */
export const CONTACT_CREATED_EVENT = 'contact.created';

/**
 * Emitido após persistir uma mensagem pública de contato; o listener envia o
 * comprovante por e-mail.
 */
export class ContactCreatedEvent {
  constructor(
    public readonly contactId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly phone: string,
    public readonly message: string,
    public readonly type: ContactType,
  ) {}
}
