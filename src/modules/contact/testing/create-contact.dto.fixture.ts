import { ContactType } from '@/generated/prisma/client';

import type { CreateContactDTO } from '../dtos/create-contact.dto';

/** SHA-256 hex válido para testes do DTO/guards. */
export const TEST_CONTACT_SESSION_HASH = 'a'.repeat(64);

export function buildCreateContactDto(
  overrides: Partial<CreateContactDTO> = {},
): CreateContactDTO {
  return {
    email: 'user@example.com',
    name: 'Maria Silva',
    phone: '+5511999999999',
    message: 'Mensagem de teste com mais de dez caracteres.',
    type: ContactType.question,
    website: '',
    sessionHash: TEST_CONTACT_SESSION_HASH,
    formOpenedAt: Date.now() - 10_000,
    ...overrides,
  };
}
