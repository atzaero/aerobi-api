import type { Prisma } from '@/generated/prisma/client';
import { ContactMessageStatus, ContactType } from '@/generated/prisma/client';

/** Filtros compartilhados entre listagem e export de mensagens de contato. */
export interface ContactListFilters {
  type?: ContactType;
  status?: ContactMessageStatus;
  email?: string;
  phone?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Monta o `where` Prisma para list/export de `contact` (exclui soft-deleted no
 * repository). Espelha os filtros do `aerobi-web` `list/service.ts`.
 */
export function buildContactWhereInput(
  filters: ContactListFilters,
): Prisma.ContactWhereInput {
  const where: Prisma.ContactWhereInput = {};

  if (filters.type !== undefined) {
    where.type = filters.type;
  }
  if (filters.status !== undefined) {
    where.status = filters.status;
  }
  if (filters.email?.trim()) {
    where.email = { contains: filters.email.trim(), mode: 'insensitive' };
  }
  if (filters.phone?.trim()) {
    const digits = filters.phone.replace(/\D/g, '');
    if (digits.length > 0) {
      where.phone = { contains: digits };
    }
  }
  if (filters.startDate) {
    where.createdAt = {
      ...(where.createdAt as Prisma.DateTimeFilter | undefined),
      gte: new Date(`${filters.startDate}T00:00:00.000Z`),
    };
  }
  if (filters.endDate) {
    const endExclusive = new Date(`${filters.endDate}T00:00:00.000Z`);
    endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
    where.createdAt = {
      ...(where.createdAt as Prisma.DateTimeFilter | undefined),
      lt: endExclusive,
    };
  }

  return where;
}
