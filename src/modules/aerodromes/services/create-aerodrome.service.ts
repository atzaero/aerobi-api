import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { httpError } from '@/common/exceptions/http-error.util';
import { resolveActorGroupScope } from '@/common/utils/group-scope.util';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';
import { CreateAerodromeDTO } from '../dtos/create-aerodrome.dto';
import { AerodromeMapper } from '../mappers/aerodrome.mapper';
import { buildAerodromeCreateInput } from '../mappers/aerodrome.prisma.mapper';
import { AerodromeRepository } from '../repositories/aerodrome.repository';

import {
  assertActiveGroup,
  rethrowAerodromeUniqueConflict,
} from './aerodrome-write.helpers';

@Injectable()
export class CreateAerodromeService {
  constructor(
    private readonly repo: AerodromeRepository,
    private readonly userRepository: UserRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    dto: CreateAerodromeDTO,
    actor: AuthenticatedUser,
  ): Promise<AerodromeResponseDTO> {
    /**
     * Escopo de criação (espelha `resolveGroupScope` do web): COORDINATOR só cria
     * no próprio grupo; ADMIN em qualquer grupo. Como o recurso ainda não existe,
     * não há `GroupScopeGuard` de `:id` — o escopo é aplicado aqui. COORDINATOR
     * sem grupo (`none`) não cria nada.
     */
    const scope = await resolveActorGroupScope(
      actor.role,
      actor.id,
      this.userRepository,
      this.errorMessageService,
    );
    if (
      scope.kind === 'none' ||
      (scope.kind === 'group' && dto.groupId !== scope.groupId)
    ) {
      throw httpError(
        this.errorMessageService,
        ErrorCode.FORBIDDEN,
        HttpStatus.FORBIDDEN,
        { RESOURCE: 'Aeródromo' },
      );
    }

    await assertActiveGroup(this.repo, this.errorMessageService, dto.groupId);

    try {
      const created = await this.repo.create(
        buildAerodromeCreateInput(dto, actor.id),
      );
      return AerodromeMapper.toApiRow(created);
    } catch (err) {
      rethrowAerodromeUniqueConflict(err, this.errorMessageService, dto.icao);
    }
  }
}
