import { Injectable } from '@nestjs/common';

import { Prisma, type Contact } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import {
  buildContactWhereInput,
  type ContactListFilters,
} from '../utils/build-contact-filters.util';
import type { IContactRepository } from './contact.repository.interface';

const activeWhere: Pick<Prisma.ContactWhereInput, 'deletedAt'> = {
  deletedAt: null,
};

@Injectable()
export class ContactRepository implements IContactRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ContactCreateInput): Promise<Contact> {
    return this.prisma.contact.create({ data });
  }

  async hardDelete(id: string): Promise<void> {
    await this.prisma.contact.delete({ where: { id } });
  }

  findByIdActive(id: string): Promise<Contact | null> {
    return this.prisma.contact.findFirst({
      where: { id, ...activeWhere },
    });
  }

  findMany(
    filters: ContactListFilters,
    skip: number,
    take: number,
  ): Promise<Contact[]> {
    return this.prisma.contact.findMany({
      where: { AND: [buildContactWhereInput(filters), activeWhere] },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  count(filters: ContactListFilters): Promise<number> {
    return this.prisma.contact.count({
      where: { AND: [buildContactWhereInput(filters), activeWhere] },
    });
  }

  findManyForExport(
    filters: ContactListFilters,
    take: number,
  ): Promise<Contact[]> {
    return this.prisma.contact.findMany({
      where: { AND: [buildContactWhereInput(filters), activeWhere] },
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  countForExport(filters: ContactListFilters): Promise<number> {
    return this.prisma.contact.count({
      where: { AND: [buildContactWhereInput(filters), activeWhere] },
    });
  }

  async hasActiveDuplicate(
    field: 'sessionHash' | 'email',
    value: string,
    date: string,
  ): Promise<boolean> {
    const row = await this.prisma.contact.findFirst({
      where: {
        [field]: value,
        date,
        ...activeWhere,
      },
      select: { id: true },
    });
    return row !== null;
  }

  async countActiveByIpHashAndDate(
    ipHash: string,
    date: string,
  ): Promise<number> {
    return await this.prisma.contact.count({
      where: {
        ipHash,
        date,
        ...activeWhere,
      },
    });
  }

  updateStatus(
    id: string,
    status: Contact['status'],
    updatedBy: string,
  ): Promise<Contact> {
    return this.prisma.contact.update({
      where: { id, ...activeWhere },
      data: { status, updatedBy },
    });
  }

  softDelete(id: string, deletedBy: string): Promise<Contact> {
    return this.prisma.contact.update({
      where: { id, ...activeWhere },
      data: {
        deletedAt: new Date(),
        deletedBy,
        updatedBy: deletedBy,
      },
    });
  }
}
