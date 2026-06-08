import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { StorageService } from '@/modules/storage/services/storage.service';

import { AircraftReadingResponseDTO } from '../dtos/aircraft-reading-response.dto';
import { AircraftReadingMapper } from '../mappers/aircraft-reading.mapper';
import { AircraftReadingRepository } from '../repositories/aircraft-reading.repository';
import { resolveReadingImageUrl } from '../utils/resolve-reading-image-url';

export type RemoveAircraftReadingInput = { id: string; deletedBy: string };

@Injectable()
export class RemoveAircraftReadingService {
  constructor(
    private readonly repo: AircraftReadingRepository,
    private readonly storage: StorageService,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    input: RemoveAircraftReadingInput,
  ): Promise<AircraftReadingResponseDTO> {
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
    return AircraftReadingMapper.toApiRow(deleted, imageUrl);
  }
}
