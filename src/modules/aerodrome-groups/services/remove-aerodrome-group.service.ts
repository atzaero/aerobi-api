import { HttpStatus, Injectable } from '@nestjs/common';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { ErrorCode } from '@/common/enums/error-code.enum';

import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';
import { AerodromeGroupMapper } from '../mappers/aerodrome-group.mapper';
import { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';

export type RemoveAerodromeGroupServiceInput = {
  id: string;
  deletedBy: string;
};

@Injectable()
export class RemoveAerodromeGroupService {
  constructor(
    private readonly repo: AerodromeGroupRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    input: RemoveAerodromeGroupServiceInput,
  ): Promise<AerodromeGroupResponseDTO> {
    const existing = await this.repo.findById(input.id);
    if (!existing) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
          RESOURCE: 'Grupo de aeródromos',
          ID: input.id,
        }),
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    const deleted = await this.repo.softDelete(input.id, input.deletedBy);
    return AerodromeGroupMapper.toApiRow(deleted);
  }
}
