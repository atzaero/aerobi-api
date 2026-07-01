import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { httpError } from '@/common/exceptions/http-error.util';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';
import { UpdateAerodromeDTO } from '../dtos/update-aerodrome.dto';
import { AerodromeMapper } from '../mappers/aerodrome.mapper';
import { patchAerodromeToPrisma } from '../mappers/aerodrome.prisma.mapper';
import { AerodromeRepository } from '../repositories/aerodrome.repository';

import {
  assertActiveGroup,
  rethrowAerodromeUniqueConflict,
} from './aerodrome-write.helpers';

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

    /**
     * `groupId` ausente = não move (PATCH parcial); só a troca explícita para um
     * grupo diferente conta. `targetGroupId` guarda o destino (ou `undefined`),
     * o que também estreita o tipo para o TS nas checagens abaixo.
     */
    const targetGroupId =
      dto.groupId !== undefined && dto.groupId !== existing.groupId
        ? dto.groupId
        : undefined;

    /** COORDINATOR não move o aeródromo entre grupos (só ADMIN pode). */
    if (targetGroupId !== undefined && actor.role !== UserRole.ADMIN) {
      throw httpError(
        this.errorMessageService,
        ErrorCode.FORBIDDEN,
        HttpStatus.FORBIDDEN,
        { RESOURCE: 'Aeródromo' },
      );
    }

    /** Grupo de destino (quando muda) precisa existir e estar ativo. */
    if (targetGroupId !== undefined) {
      await assertActiveGroup(
        this.repo,
        this.errorMessageService,
        targetGroupId,
      );
    }

    try {
      const updated = await this.repo.update(
        id,
        patchAerodromeToPrisma(dto, actor.id),
      );
      return AerodromeMapper.toApiRow(updated);
    } catch (err) {
      rethrowAerodromeUniqueConflict(
        err,
        this.errorMessageService,
        dto.icao ?? existing.icao,
      );
    }
  }
}
