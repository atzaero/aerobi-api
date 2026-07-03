import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';

import type { AuditLogResponseDto } from '../dtos/audit-log-response.dto';
import { toAuditLogResponse } from '../mappers/audit-log.mapper';
import { AuditLogRepository } from '../repositories/audit-log.repository';

/**
 * Leitura de um registro de auditoria por id (`GET /audit-logs/:id`). O web
 * devolve `null` quando inexistente (server action); na API HTTP isto vira
 * **404 `RESOURCE_NOT_FOUND`**, seguindo o padrão da casa. Sem escopo de grupo.
 */
@Injectable()
export class FindAuditLogByIdService {
  constructor(
    private readonly repository: AuditLogRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(id: string): Promise<AuditLogResponseDto> {
    const log = await this.repository.findById(id);

    if (!log) {
      throw resourceNotFound(this.errorMessageService, 'AuditLog', id);
    }

    return toAuditLogResponse(log);
  }
}
