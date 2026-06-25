import { HttpStatus, Injectable } from '@nestjs/common';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { ErrorCode } from '@/common/enums/error-code.enum';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';
import { UpdateAerodromeGroupDTO } from '../dtos/update-aerodrome-group.dto';
import { AerodromeGroupMapper } from '../mappers/aerodrome-group.mapper';
import { patchAerodromeGroupToPrisma } from '../mappers/aerodrome-group.prisma.mapper';
import { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';

@Injectable()
export class UpdateAerodromeGroupService {
  constructor(
    private readonly repo: AerodromeGroupRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    id: string,
    dto: UpdateAerodromeGroupDTO,
    actor: AuthenticatedUser,
  ): Promise<AerodromeGroupResponseDTO> {
    /**
     * O `GroupScopeGuard` valida escopo/existência para COORDINATOR, mas faz
     * bypass para ADMIN — por isso a checagem de existência (404) permanece aqui.
     */
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
          RESOURCE: 'Grupo de aeródromos',
          ID: id,
        }),
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    const updated = await this.repo.update(
      id,
      patchAerodromeGroupToPrisma(dto, actor.id),
    );
    return AerodromeGroupMapper.toApiRow(updated);
  }
}
