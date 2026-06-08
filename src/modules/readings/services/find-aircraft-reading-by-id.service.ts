import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { StorageService } from '@/modules/storage/services/storage.service';

import { AircraftReadingResponseDTO } from '../dtos/aircraft-reading-response.dto';
import { AircraftReadingMapper } from '../mappers/aircraft-reading.mapper';
import { AircraftReadingRepository } from '../repositories/aircraft-reading.repository';
import { resolveReadingImageUrl } from '../utils/resolve-reading-image-url';

@Injectable()
export class FindAircraftReadingByIdService {
  constructor(
    private readonly repo: AircraftReadingRepository,
    private readonly storage: StorageService,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(id: string): Promise<AircraftReadingResponseDTO> {
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
    const imageUrl = await resolveReadingImageUrl(
      this.storage,
      entity.imageKey,
    );
    return AircraftReadingMapper.toApiRow(entity, imageUrl);
  }
}
