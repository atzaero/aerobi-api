import { Injectable } from '@nestjs/common';

import { Prisma, type Document } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type {
  AerodromeScopeRef,
  IDocumentRepository,
} from './document.repository.interface';

const activeWhere: Pick<Prisma.DocumentWhereInput, 'deletedAt'> = {
  deletedAt: null,
};

@Injectable()
export class DocumentRepository implements IDocumentRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.DocumentCreateInput): Promise<Document> {
    return this.prisma.document.create({ data });
  }

  update(id: string, data: Prisma.DocumentUpdateInput): Promise<Document> {
    return this.prisma.document.update({
      where: { id, ...activeWhere },
      data,
    });
  }

  findById(id: string): Promise<Document | null> {
    return this.prisma.document.findFirst({ where: { id, ...activeWhere } });
  }

  findMany(
    where: Prisma.DocumentWhereInput,
    skip: number,
    take: number,
  ): Promise<Document[]> {
    return this.prisma.document.findMany({
      where: { AND: [{ ...where }, activeWhere] },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  count(where: Prisma.DocumentWhereInput): Promise<number> {
    return this.prisma.document.count({
      where: { AND: [{ ...where }, activeWhere] },
    });
  }

  findAllForExport(
    where: Prisma.DocumentWhereInput,
    take: number,
  ): Promise<Document[]> {
    return this.prisma.document.findMany({
      where: { AND: [{ ...where }, activeWhere] },
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  softDelete(id: string, deletedBy: string): Promise<Document> {
    return this.prisma.document.update({
      where: { id, ...activeWhere },
      data: { deletedAt: new Date(), deletedBy, updatedBy: deletedBy },
    });
  }

  async softDeletePreviousActive(
    aerodromeId: string,
    type: Document['type'],
    keepId: string,
    deletedBy: string,
  ): Promise<number> {
    const result = await this.prisma.document.updateMany({
      where: { aerodromeId, type, id: { not: keepId }, ...activeWhere },
      data: { deletedAt: new Date(), deletedBy, updatedBy: deletedBy },
    });
    return result.count;
  }

  async findAerodromeForScope(
    aerodromeId: string,
  ): Promise<AerodromeScopeRef | null> {
    const aerodrome = await this.prisma.aerodrome.findFirst({
      where: { id: aerodromeId, deletedAt: null },
      select: { groupId: true, group: { select: { uf: true } } },
    });
    return aerodrome
      ? { groupId: aerodrome.groupId, uf: aerodrome.group.uf }
      : null;
  }
}
