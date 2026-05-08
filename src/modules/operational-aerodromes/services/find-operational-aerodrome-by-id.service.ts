import { HttpStatus, Injectable } from '@nestjs/common';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { ErrorCode } from '@/common/enums/error-code.enum';

import { OperationalAerodromeResponseDTO } from '../dtos/operational-aerodrome-response.dto';
import { OperationalAerodromeMapper } from '../mappers/operational-aerodrome.mapper';
import { OperationalAerodromeRepository } from '../repositories/operational-aerodrome.repository';

export type FindOperationalAerodromeByIdServiceInput = { id: string };

@Injectable()
export class FindOperationalAerodromeByIdService {
  constructor(
    private readonly repo: OperationalAerodromeRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    input: FindOperationalAerodromeByIdServiceInput,
  ): Promise<OperationalAerodromeResponseDTO> {
    const entity = await this.repo.findById(input.id);
    if (!entity) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
          RESOURCE: 'Aeródromo operacional',
          ID: input.id,
        }),
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    return OperationalAerodromeMapper.toApiRow(entity);
  }
}
