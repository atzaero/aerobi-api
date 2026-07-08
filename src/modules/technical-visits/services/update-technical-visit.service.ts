import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { ErrorCode } from '@/common/enums/error-code.enum';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { AuditAction } from '@/generated/prisma/client';
import { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { RecordAuditContext } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import { UpdateTechnicalVisitDTO } from '../dtos/update-technical-visit.dto';
import { patchTechnicalVisitToPrisma } from '../mappers/technical-visit.prisma.mapper';
import { TechnicalVisitRepository } from '../repositories/technical-visit.repository';
import { technicalVisitAuditSnapshot } from '../utils/technical-visit-audit';
import { toTechnicalVisitApiRow } from '../utils/technical-visit-response';

export type UpdateTechnicalVisitServiceInput = UpdateTechnicalVisitDTO & {
  id: string;
};

@Injectable()
export class UpdateTechnicalVisitService {
  constructor(
    private readonly repo: TechnicalVisitRepository,
    private readonly userRepository: UserRepository,
    private readonly errorMessageService: ErrorMessageService,
    private readonly auditRecorder: AuditRecorderService,
  ) {}

  async execute(
    input: UpdateTechnicalVisitServiceInput,
    actor: AuthenticatedUser,
    auditContext: RecordAuditContext = {},
  ): Promise<TechnicalVisitResponseDTO> {
    const { id, ...dto } = input;

    const existing = await this.repo.findByIdWithAerodrome(id);
    if (!existing) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
          RESOURCE: 'Visita técnica',
          ID: id,
        }),
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    const before = technicalVisitAuditSnapshot(existing);

    const updated = await this.repo.update(
      id,
      patchTechnicalVisitToPrisma(
        dto,
        actor.id,
        existing.modifierUsers,
        existing.modifierAtTimes,
      ),
    );

    await this.auditRecorder.record(
      {
        action: AuditAction.UPDATE,
        entityType: 'technical_visit',
        entityId: id,
        before,
        after: technicalVisitAuditSnapshot(updated),
      },
      auditContext,
    );

    return toTechnicalVisitApiRow(this.userRepository, updated);
  }
}
