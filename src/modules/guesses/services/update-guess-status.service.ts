import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import { AuditAction } from '@/generated/prisma/client';
import { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { RecordAuditContext } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { UpdateGuessStatusResponseDTO } from '../dtos/guess.dto';
import { UpdateGuessStatusDTO } from '../dtos/update-guess-status.dto';
import {
  guessStatusFromApi,
  guessStatusToApi,
} from '../mappers/maintenance-guess.prisma.mapper';
import { MaintenanceGuessRepository } from '../repositories/maintenance-guess.repository';
import { guessAuditSnapshot } from '../utils/guess-audit';

@Injectable()
export class UpdateGuessStatusService {
  constructor(
    private readonly guessRepo: MaintenanceGuessRepository,
    private readonly errorMessageService: ErrorMessageService,
    private readonly auditRecorder: AuditRecorderService,
  ) {}

  async execute(
    id: string,
    dto: UpdateGuessStatusDTO,
    actor: AuthenticatedUser,
    auditContext: RecordAuditContext = {},
  ): Promise<UpdateGuessStatusResponseDTO> {
    const existing = await this.guessRepo.findById(id);
    if (!existing) {
      throw resourceNotFound(this.errorMessageService, 'Palpite', id);
    }

    const status = guessStatusFromApi(dto.status);
    const updated = await this.guessRepo.updateStatus(id, status, actor.id);

    await this.auditRecorder.record(
      {
        action: AuditAction.UPDATE,
        entityType: 'guess',
        entityId: id,
        before: guessAuditSnapshot(existing),
        after: guessAuditSnapshot(updated),
        metadata: {
          scope: 'moderate',
          maintenanceId: existing.task.maintenanceId,
        },
      },
      auditContext,
    );

    const response = new UpdateGuessStatusResponseDTO();
    response.id = updated.id;
    response.status = guessStatusToApi(updated.status);
    response.maintenanceId = existing.task.maintenanceId;
    return response;
  }
}
