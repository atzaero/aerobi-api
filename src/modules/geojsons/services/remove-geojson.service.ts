import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import { AuditAction } from '@/generated/prisma/client';
import { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { RecordAuditContext } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { GeojsonResponseDTO } from '../dtos/geojson-response.dto';
import { GeojsonMapper } from '../mappers/geojson.mapper';
import { GeojsonRepository } from '../repositories/geojson.repository';
import { geojsonAuditSnapshot } from '../utils/geojson-audit';

/**
 * Soft-delete administrativo de um GeoJSON (`aerodrome:delete` é ADMIN-only; o
 * escopo por grupo é garantido pelo `GroupScopeGuard` no `:id`). Grava o ator
 * real (`deletedBy = actor.id`, fim do `deletedBy: 'system'`) e a trilha de
 * auditoria (`DELETE`).
 */
@Injectable()
export class RemoveGeojsonService {
  constructor(
    private readonly repo: GeojsonRepository,
    private readonly errorMessageService: ErrorMessageService,
    private readonly auditRecorder: AuditRecorderService,
  ) {}

  async execute(
    id: string,
    actor: AuthenticatedUser,
    auditContext: RecordAuditContext = {},
  ): Promise<GeojsonResponseDTO> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw resourceNotFound(
        this.errorMessageService,
        'GeoJSON operacional',
        id,
      );
    }

    const deleted = await this.repo.softDelete(id, actor.id);

    await this.auditRecorder.record(
      {
        action: AuditAction.DELETE,
        entityType: 'geojson',
        entityId: id,
        before: geojsonAuditSnapshot(existing),
      },
      auditContext,
    );

    return GeojsonMapper.toApiRow(deleted);
  }
}
