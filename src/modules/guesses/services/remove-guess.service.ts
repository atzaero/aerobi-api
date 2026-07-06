import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import { AuditAction } from '@/generated/prisma/client';
import { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { RecordAuditContext } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { RemoveGuessResponseDTO } from '../dtos/guess.dto';
import { MaintenanceGuessRepository } from '../repositories/maintenance-guess.repository';

@Injectable()
export class RemoveGuessService {
  constructor(
    private readonly guessRepo: MaintenanceGuessRepository,
    private readonly errorMessageService: ErrorMessageService,
    private readonly auditRecorder: AuditRecorderService,
  ) {}

  async execute(
    id: string,
    actor: AuthenticatedUser,
    auditContext: RecordAuditContext = {},
  ): Promise<RemoveGuessResponseDTO> {
    const existing = await this.guessRepo.findById(id);
    if (!existing) {
      throw resourceNotFound(this.errorMessageService, 'Palpite', id);
    }

    await this.guessRepo.softDelete(id, actor.id);

    await this.auditRecorder.record(
      {
        action: AuditAction.DELETE,
        entityType: 'guess',
        entityId: id,
        before: { id: existing.id },
        metadata: { maintenanceId: existing.task.maintenanceId },
      },
      auditContext,
    );

    const response = new RemoveGuessResponseDTO();
    response.id = id;
    response.maintenanceId = existing.task.maintenanceId;
    return response;
  }
}
