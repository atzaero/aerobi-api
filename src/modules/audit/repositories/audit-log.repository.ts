import { Injectable } from '@nestjs/common';

import type { AuditLog } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import {
  buildAuditLogCreateInput,
  buildAuditLogWhere,
} from './audit-log-prisma.builder';
import type {
  AuditLogFilters,
  CreateAuditLogData,
  IAuditLogRepository,
  ListAuditLogsParams,
  ListAuditLogsResult,
} from './audit-log.repository.interface';

/**
 * Acesso a `AuditLog` via Prisma. A montagem de input/where vive em
 * `audit-log-prisma.builder.ts` (funções puras); aqui só persistimos/
 * consultamos. Ordenação sempre `createdAt DESC` com tiebreaker `id DESC`
 * (paginação determinística).
 */
@Injectable()
export class AuditLogRepository implements IAuditLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAuditLogData): Promise<AuditLog> {
    return this.prisma.auditLog.create({
      data: buildAuditLogCreateInput(data),
    });
  }

  async findManyPaginated(
    params: ListAuditLogsParams,
  ): Promise<ListAuditLogsResult> {
    const where = buildAuditLogWhere(params);

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { rows, total };
  }

  async findById(id: string): Promise<AuditLog | null> {
    return this.prisma.auditLog.findUnique({ where: { id } });
  }

  async findManyForExport(
    filters: AuditLogFilters,
    take: number,
  ): Promise<AuditLog[]> {
    return this.prisma.auditLog.findMany({
      where: buildAuditLogWhere(filters),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take,
    });
  }

  async countForExport(filters: AuditLogFilters): Promise<number> {
    return this.prisma.auditLog.count({ where: buildAuditLogWhere(filters) });
  }
}
