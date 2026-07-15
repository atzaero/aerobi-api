import { Injectable } from '@nestjs/common';

import { AuditAction } from '@/generated/prisma/client';
import { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { RecordAuditContext } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { StorageService } from '@/modules/storage/services/storage.service';

import { GroupResponseDTO } from '../dtos/group-response.dto';
import { CreateGroupDTO } from '../dtos/create-group.dto';
import { buildGroupCreateInput } from '../mappers/group.prisma.mapper';
import { GroupRepository } from '../repositories/group.repository';
import { groupAuditSnapshot } from '../utils/group-audit';
import { toGroupApiRowWithImage } from '../utils/group-response';

@Injectable()
export class CreateGroupService {
  constructor(
    private readonly repo: GroupRepository,
    private readonly storage: StorageService,
    private readonly auditRecorder: AuditRecorderService,
  ) {}

  async execute(
    dto: CreateGroupDTO,
    actor: AuthenticatedUser,
    auditContext: RecordAuditContext = {},
  ): Promise<GroupResponseDTO> {
    const created = await this.repo.create(
      buildGroupCreateInput(dto, actor.id),
    );

    await this.auditRecorder.record(
      {
        action: AuditAction.CREATE,
        entityType: 'group',
        entityId: created.id,
        after: groupAuditSnapshot(created),
      },
      auditContext,
    );

    return toGroupApiRowWithImage(this.storage, created);
  }
}
