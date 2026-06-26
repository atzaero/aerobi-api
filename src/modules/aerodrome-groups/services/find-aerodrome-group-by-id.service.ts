import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import { StorageService } from '@/modules/storage/services/storage.service';

import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';
import { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';
import { toAerodromeGroupApiRowWithImage } from '../utils/aerodrome-group-response';

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
      throw resourceNotFound(
        this.errorMessageService,
        'Grupo de aeródromos',
        id,
      );
    }
    return toAerodromeGroupApiRowWithImage(this.storage, entity);
  }
}
