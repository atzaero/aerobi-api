import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { StorageService } from '@/modules/storage/services/storage.service';

import { MovementResponseDTO } from '../dtos/movement-response.dto';
import { MovementMapper } from '../mappers/movement.mapper';
import { MovementRepository } from '../repositories/movement.repository';
import { resolveReadingImageUrl } from '../utils/resolve-reading-image-url';

export type RemoveMovementInput = { id: string; deletedBy: string };

@Injectable()
export class RemoveMovementService {
  constructor(
    private readonly repo: MovementRepository,
    private readonly storage: StorageService,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(input: RemoveMovementInput): Promise<MovementResponseDTO> {
    const existing = await this.repo.findById(input.id);
    if (!existing) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
          RESOURCE: 'Leitura',
          ID: input.id,
        }),
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    const deleted = await this.repo.softDelete(input.id, input.deletedBy);
    const imageUrl = await resolveReadingImageUrl(
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
