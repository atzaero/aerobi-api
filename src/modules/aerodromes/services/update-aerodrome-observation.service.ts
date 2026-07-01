import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';
import { UpdateAerodromeObservationDTO } from '../dtos/update-aerodrome-observation.dto';
import { AerodromeMapper } from '../mappers/aerodrome.mapper';
import {
  buildAerodromeObservationPatch,
  normalizeObservation,
} from '../mappers/aerodrome.prisma.mapper';
import { AerodromeRepository } from '../repositories/aerodrome.repository';

@Injectable()
export class UpdateAerodromeObservationService {
  constructor(
    private readonly repo: AerodromeRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    id: string,
    dto: UpdateAerodromeObservationDTO,
    actor: AuthenticatedUser,
  ): Promise<AerodromeResponseDTO> {
    /** Escopo por grupo já validado pelo `GroupScopeGuard`; aqui só a existência. */
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw resourceNotFound(this.errorMessageService, 'Aeródromo', id);
    }

    /** Vazio/ausente limpa o campo (paridade com o transform do web). */
    const updated = await this.repo.update(
      id,
      buildAerodromeObservationPatch(
        normalizeObservation(dto.observation),
        actor.id,
      ),
    );
    return AerodromeMapper.toApiRow(updated);
  }
}
