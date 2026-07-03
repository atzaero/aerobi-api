import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import { AuditAction } from '@/generated/prisma/client';
import { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { RecordAuditContext } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { StorageService } from '@/modules/storage/services/storage.service';

import { GroupResponseDTO } from '../dtos/group-response.dto';
import { UpdateGroupDTO } from '../dtos/update-group.dto';
import { patchGroupToPrisma } from '../mappers/group.prisma.mapper';
import { GroupRepository } from '../repositories/group.repository';
import { groupAuditSnapshot } from '../utils/group-audit';
import { toGroupApiRowWithImage } from '../utils/group-response';

@Injectable()
export class UpdateGroupService {
  constructor(
    private readonly repo: GroupRepository,
    private readonly storage: StorageService,
    private readonly errorMessageService: ErrorMessageService,
    private readonly auditRecorder: AuditRecorderService,
  ) {}

  async execute(
    id: string,
    dto: UpdateGroupDTO,
    actor: AuthenticatedUser,
    auditContext: RecordAuditContext = {},
  ): Promise<GroupResponseDTO> {
    /**
     * `group:update` é ADMIN-only (`PermissionsGuard`), sem escopo por grupo —
     * a checagem de existência (404) é responsabilidade exclusiva deste service.
     */
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw resourceNotFound(
        this.errorMessageService,
        'Grupo de aeródromos',
        id,
      );
    }
    const updated = await this.repo.update(
      id,
      patchGroupToPrisma(dto, actor.id),
    );

    await this.auditRecorder.record(
      {
        action: AuditAction.UPDATE,
        entityType: 'group',
        entityId: id,
        before: groupAuditSnapshot(existing),
        after: groupAuditSnapshot(updated),
      },
      auditContext,
    );

    return toGroupApiRowWithImage(this.storage, updated);
  }
}
