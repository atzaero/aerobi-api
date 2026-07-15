import type { Prisma, Contact } from '@/generated/prisma/client';

import type { ContactListFilters } from '../utils/build-contact-filters.util';

export interface IContactRepository {
  create(data: Prisma.ContactCreateInput): Promise<Contact>;
  hardDelete(id: string): Promise<void>;
  findByIdActive(id: string): Promise<Contact | null>;
  findMany(
    filters: ContactListFilters,
    skip: number,
    take: number,
  ): Promise<Contact[]>;
  count(filters: ContactListFilters): Promise<number>;
  findManyForExport(
    filters: ContactListFilters,
    take: number,
  ): Promise<Contact[]>;
  countForExport(filters: ContactListFilters): Promise<number>;
  hasActiveDuplicate(
    field: 'sessionHash' | 'email',
    value: string,
    date: string,
  ): Promise<boolean>;
  countActiveByIpHashAndDate(ipHash: string, date: string): Promise<number>;
  updateStatus(
    id: string,
    status: Contact['status'],
    updatedBy: string,
  ): Promise<Contact>;
  softDelete(id: string, deletedBy: string): Promise<Contact>;
}

/**
 * Injection token (Symbol) para injetar `IContactRepository` via DI do Nest.
 */
export const CONTACT_REPOSITORY = Symbol('IContactRepository');
