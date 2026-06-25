import { HttpStatus, Injectable } from '@nestjs/common';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { ErrorCode } from '@/common/enums/error-code.enum';
import { StorageService } from '@/modules/storage/services/storage.service';

import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';
import { AerodromeGroupMapper } from '../mappers/aerodrome-group.mapper';
import { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';
import { resolveAerodromeGroupImageUrl } from '../utils/resolve-aerodrome-group-image-url';

@Injectable()
export class FindAerodromeGroupByIdService {
  constructor(
    private readonly repo: AerodromeGroupRepository,
    private readonly storage: StorageService,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(id: string): Promise<AerodromeGroupResponseDTO> {
    const entity = await this.repo.findById(id);
    if (!entity) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
          RESOURCE: 'Grupo de aeródromos',
          ID: id,
        }),
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    const imageUrl = await resolveAerodromeGroupImageUrl(
      this.storage,
      entity.imageKey,
    );
    return AerodromeGroupMapper.toApiRow(entity, imageUrl);
  }
}
