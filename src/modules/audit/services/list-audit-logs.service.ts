import { Injectable } from '@nestjs/common';

import { resolvePaginationParams } from '@/common/utils/pagination-params.util';

import type { ListAuditLogsQueryDto } from '../dtos/list-audit-logs-query.dto';
import { AuditLogsPaginatedResponseDto } from '../dtos/audit-logs-paginated-response.dto';
import { toAuditLogResponse } from '../mappers/audit-log.mapper';
import { AuditLogRepository } from '../repositories/audit-log.repository';

/**
 * Listagem paginada de auditoria (`GET /audit-logs`). **Sem escopo de grupo**
 * (paridade com o web: ADMIN e COORDINATOR veem todos os logs). Filtros por
 * igualdade exata + range `[from, to]`; ordenação `createdAt DESC`.
 */
@Injectable()
export class ListAuditLogsService {
  constructor(private readonly repository: AuditLogRepository) {}

  async execute(
    query: ListAuditLogsQueryDto,
  ): Promise<AuditLogsPaginatedResponseDto> {
    const { page, limit, skip } = resolvePaginationParams(query, 100, {
      defaultLimit: 20,
    });

    const { rows, total } = await this.repository.findManyPaginated({
      skip,
      take: limit,
      entityType: query.entityType,
      actorEmail: query.actorEmail,
      action: query.action,
      from: query.from !== undefined ? new Date(query.from) : undefined,
      to: query.to !== undefined ? new Date(query.to) : undefined,
    });

    return new AuditLogsPaginatedResponseDto(
      rows.map(toAuditLogResponse),
      page,
      limit,
      total,
    );
  }
}
