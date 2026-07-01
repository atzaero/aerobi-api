import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { httpError } from '@/common/exceptions/http-error.util';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import { isUniqueConstraintError } from '@/common/utils/prisma-error.util';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';
import { UpdateAerodromeDTO } from '../dtos/update-aerodrome.dto';
import { AerodromeMapper } from '../mappers/aerodrome.mapper';
import { buildAerodromeUpdateInput } from '../mappers/aerodrome.prisma.mapper';
import { AerodromeRepository } from '../repositories/aerodrome.repository';

@Injectable()
export class UpdateAerodromeService {
  constructor(
    private readonly repo: AerodromeRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    id: string,
    dto: UpdateAerodromeDTO,
    actor: AuthenticatedUser,
  ): Promise<AerodromeResponseDTO> {
    /**
     * O `GroupScopeGuard` já garantiu que o recurso pertence ao grupo do ator
     * (ADMIN faz bypass); aqui a existência (404) e as regras de negócio.
     */
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw resourceNotFound(this.errorMessageService, 'Aeródromo', id);
    }

    const isMovingGroup = dto.groupId !== existing.groupId;

    /** COORDINATOR não move o aeródromo entre grupos (só ADMIN pode). */
    if (isMovingGroup && actor.role !== UserRole.ADMIN) {
      throw httpError(
        this.errorMessageService,
        ErrorCode.FORBIDDEN,
        HttpStatus.FORBIDDEN,
        { RESOURCE: 'Aeródromo' },
      );
    }

    /** Grupo de destino (quando muda) precisa existir e estar ativo. */
    if (isMovingGroup) {
      const group = await this.repo.findActiveGroup(dto.groupId);
      if (!group) {
        throw httpError(
          this.errorMessageService,
          ErrorCode.VALIDATION_FAILED,
          HttpStatus.BAD_REQUEST,
          { DETAILS: 'Grupo inválido ou inexistente' },
        );
      }
    }

    try {
      const updated = await this.repo.update(
        id,
        buildAerodromeUpdateInput(dto, actor.id),
      );
      return AerodromeMapper.toApiRow(updated);
    } catch (err) {
      /** `@@unique([groupId, icao])` — ICAO já usado no grupo. */
      if (isUniqueConstraintError(err)) {
        throw httpError(
          this.errorMessageService,
          ErrorCode.CONFLICT,
          HttpStatus.CONFLICT,
          { DETAILS: `Já existe um aeródromo ${dto.icao} neste grupo` },
        );
      }
      throw err;
    }
  }
}
