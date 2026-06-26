import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { StorageService } from '@/modules/storage/services/storage.service';
import { resolveBestEffortPresignedUrl } from '@/modules/storage/utils/resolve-presigned-url';

import { MovementResponseDTO } from '../dtos/movement-response.dto';
import { MovementMapper } from '../mappers/movement.mapper';
import { MovementRepository } from '../repositories/movement.repository';

@Injectable()
export class FindMovementByIdService {
  constructor(
    private readonly repo: MovementRepository,
    private readonly storage: StorageService,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(id: string): Promise<MovementResponseDTO> {
    const entity = await this.repo.findById(id);
    if (!entity) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
          RESOURCE: 'Leitura',
          ID: id,
        }),
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    const imageUrl = await resolveBestEffortPresignedUrl(
      this.storage,
      entity.imageKey,
    );
    return MovementMapper.toApiRow(entity, imageUrl);
  }
}
