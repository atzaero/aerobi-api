import { ContactMessageStatus, ContactType } from '@/generated/prisma/client';

import type { Contact } from '@/generated/prisma/client';

export function buildContactFixture(overrides: Partial<Contact> = {}): Contact {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'user@example.com',
    name: 'Maria Silva',
    phone: '+5511999999999',
    message: 'Mensagem de teste com mais de dez caracteres.',
    type: ContactType.question,
    status: ContactMessageStatus.pending,
    sessionHash: 'sess-abc',
    date: '2026-06-30',
    ipHash: 'hash-ip',
    createdAt: new Date('2026-06-30T12:00:00.000Z'),
    createdBy: null,
    updatedAt: new Date('2026-06-30T12:00:00.000Z'),
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  };
}
