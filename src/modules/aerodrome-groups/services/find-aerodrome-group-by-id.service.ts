import { HttpStatus, Injectable } from '@nestjs/common';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { ErrorCode } from '@/common/enums/error-code.enum';

import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';
import { AerodromeGroupMapper } from '../mappers/aerodrome-group.mapper';
import { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';

export type FindAerodromeGroupByIdServiceInput = { id: string };

@Injectable()
export class FindAerodromeGroupByIdService {
  constructor(
    private readonly repo: AerodromeGroupRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    input: FindAerodromeGroupByIdServiceInput,
  ): Promise<AerodromeGroupResponseDTO> {
    const entity = await this.repo.findById(input.id);
    if (!entity) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
          RESOURCE: 'Grupo de aeródromos',
          ID: input.id,
        }),
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    return AerodromeGroupMapper.toApiRow(entity);
  }
}
