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

@Injectable()
export class FindMovementByIdService {
  constructor(
    private readonly repo: MovementRepository,
    private readonly storage: StorageService,
    private readonly errorMessageService: ErrorMessageService,
    private readonly scopeService: MovementScopeService,
  ) {}

  async execute(
    id: string,
    actor: AuthenticatedUser,
  ): Promise<MovementResponseDTO> {
    const entity = await this.repo.findById(id);
    if (!entity) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
          RESOURCE: 'Movimento',
          ID: id,
        }),
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    await this.scopeService.assertMovementInScope(entity, id, actor);
    const imageUrl = await resolveBestEffortPresignedUrl(
      this.storage,
      entity.imageKey,
    );
    return MovementMapper.toApiRow(entity, imageUrl);
  }
}
