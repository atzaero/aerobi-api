import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import { StorageService } from '@/modules/storage/services/storage.service';

import { GroupResponseDTO } from '../dtos/group-response.dto';
import { GroupRepository } from '../repositories/group.repository';
import { toGroupApiRowWithImage } from '../utils/group-response';

@Injectable()
export class FindGroupByIdService {
  constructor(
    private readonly repo: GroupRepository,
    private readonly storage: StorageService,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(id: string): Promise<GroupResponseDTO> {
    const entity = await this.repo.findById(id);
    if (!entity) {
      throw resourceNotFound(
        this.errorMessageService,
        'Grupo de aeródromos',
        id,
      );
    }
    return toGroupApiRowWithImage(this.storage, entity);
  }
}
