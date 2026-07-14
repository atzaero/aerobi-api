import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { StorageService } from '@/modules/storage/services/storage.service';
import { resolveBestEffortPresignedUrl } from '@/modules/storage/utils/resolve-presigned-url';

import { MovementResponseDTO } from '../dtos/movement-response.dto';
import { MovementMapper } from '../mappers/movement.mapper';
import { MovementRepository } from '../repositories/movement.repository';
import { MovementScopeService } from './movement-scope.service';

export type RemoveMovementInput = { id: string };

@Injectable()
export class RemoveMovementService {
  constructor(
    private readonly repo: MovementRepository,
    private readonly storage: StorageService,
    private readonly errorMessageService: ErrorMessageService,
    private readonly scopeService: MovementScopeService,
  ) {}

  async execute(
    input: RemoveMovementInput,
    actor: AuthenticatedUser,
  ): Promise<MovementResponseDTO> {
    const existing = await this.repo.findById(input.id);
    if (!existing) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
          RESOURCE: 'Movimento',
          ID: input.id,
        }),
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    await this.scopeService.assertMovementInScope(existing, input.id, actor);
    const deleted = await this.repo.softDelete(input.id, actor.id);
    const imageUrl = await resolveBestEffortPresignedUrl(
      this.storage,
      deleted.imageKey,
    );
    // `softDelete` (update) não carrega a relação; reaproveita o snapshot já lido.
    return MovementMapper.toApiRow(
      { ...deleted, aircraftSnapshot: existing.aircraftSnapshot },
      imageUrl,
    );
  }
}
