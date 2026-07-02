import { Prisma } from '@/generated/prisma/client';

import type { CreateContactDTO } from '../dtos/create-contact.dto';

export interface ContactCreateMeta {
  date: string;
  ipHash: string | null;
  normalizedEmail: string;
}

export function buildContactCreateInput(
  dto: CreateContactDTO,
  meta: ContactCreateMeta,
): Prisma.ContactCreateInput {
  return {
    email: meta.normalizedEmail,
    name: dto.name,
    phone: dto.phone,
    message: dto.message,
    type: dto.type,
    status: 'pending',
    sessionHash: dto.sessionHash,
    date: meta.date,
    ipHash: meta.ipHash,
    createdBy: null,
  };
}
