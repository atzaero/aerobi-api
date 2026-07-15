import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';
import { SetAerodromeStatusDTO } from '../dtos/set-aerodrome-status.dto';
import { AerodromeMapper } from '../mappers/aerodrome.mapper';
import { buildAerodromeStatusPatch } from '../mappers/aerodrome.prisma.mapper';
import { AerodromeRepository } from '../repositories/aerodrome.repository';

@Injectable()
export class SetAerodromeStatusService {
  constructor(
    private readonly repo: AerodromeRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    id: string,
    dto: SetAerodromeStatusDTO,
    actor: AuthenticatedUser,
  ): Promise<AerodromeResponseDTO> {
    /** Escopo por grupo já validado pelo `GroupScopeGuard`; aqui só a existência. */
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw resourceNotFound(this.errorMessageService, 'Aeródromo', id);
    }
    const updated = await this.repo.update(
      id,
      buildAerodromeStatusPatch(dto.field, dto.value, actor.id),
    );
    return AerodromeMapper.toApiRow(updated);
  }
}
