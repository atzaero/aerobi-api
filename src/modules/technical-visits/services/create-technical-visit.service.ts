import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resolveOperationalActorScope } from '@/common/utils/group-scope.util';
import { AuditAction } from '@/generated/prisma/client';
import { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { RecordAuditContext } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { CreateTechnicalVisitDTO } from '../dtos/create-technical-visit.dto';
import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import { buildTechnicalVisitCreateInput } from '../mappers/technical-visit.prisma.mapper';
import { TechnicalVisitRepository } from '../repositories/technical-visit.repository';
import { assertAerodromeOperationalScope } from '../utils/assert-aerodrome-operational-scope';
import { technicalVisitAuditSnapshot } from '../utils/technical-visit-audit';
import { toTechnicalVisitApiRow } from '../utils/technical-visit-response';

@Injectable()
export class CreateTechnicalVisitService {
  constructor(
    private readonly repo: TechnicalVisitRepository,
    private readonly userRepository: UserRepository,
    private readonly errorMessageService: ErrorMessageService,
    private readonly auditRecorder: AuditRecorderService,
  ) {}

  async execute(
    dto: CreateTechnicalVisitDTO,
    actor: AuthenticatedUser,
    auditContext: RecordAuditContext = {},
  ): Promise<TechnicalVisitResponseDTO> {
    const scope = await resolveOperationalActorScope(
      actor.role,
      actor.id,
      this.userRepository,
      this.errorMessageService,
    );

    const aerodrome = await this.repo.findAerodromeGroupForScope(
      dto.aerodromeId,
    );
    assertAerodromeOperationalScope(
      aerodrome,
      scope,
      this.errorMessageService,
      dto.aerodromeId,
    );

    const row = await this.repo.create(
      buildTechnicalVisitCreateInput(dto, actor.id),
    );

    await this.auditRecorder.record(
      {
        action: AuditAction.CREATE,
        entityType: 'technical_visit',
        entityId: row.id,
        after: technicalVisitAuditSnapshot(row),
        metadata: { aerodromeId: dto.aerodromeId },
      },
      auditContext,
    );

    return toTechnicalVisitApiRow(this.userRepository, row);
  }
}
