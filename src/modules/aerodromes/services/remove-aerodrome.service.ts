import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';
import { AerodromeMapper } from '../mappers/aerodrome.mapper';
import { AerodromeRepository } from '../repositories/aerodrome.repository';

@Injectable()
export class RemoveAerodromeService {
  constructor(
    private readonly repo: AerodromeRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    id: string,
    actor: AuthenticatedUser,
  ): Promise<AerodromeResponseDTO> {
    /**
     * `aerodrome:delete` é ADMIN-only (`PermissionsGuard`), sem escopo por grupo —
     * a existência (404) é responsabilidade deste service. Soft-delete simples,
     * **sem cascata** (não fecha filhos nem toca storage), com ator real.
     */
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw resourceNotFound(this.errorMessageService, 'Aeródromo', id);
    }
    const deleted = await this.repo.softDelete(id, actor.id);
    return AerodromeMapper.toApiRow(deleted);
  }
}
