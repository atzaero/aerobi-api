import { HttpStatus, Injectable } from '@nestjs/common';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { ErrorCode } from '@/common/enums/error-code.enum';

import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';
import { AerodromeMapper } from '../mappers/aerodrome.mapper';
import { AerodromeRepository } from '../repositories/aerodrome.repository';

export type FindAerodromeByIdServiceInput = { id: string };

@Injectable()
export class FindAerodromeByIdService {
  constructor(
    private readonly repo: AerodromeRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    input: FindAerodromeByIdServiceInput,
  ): Promise<AerodromeResponseDTO> {
    const entity = await this.repo.findById(input.id);
    if (!entity) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
          RESOURCE: 'Aeródromo',
          ID: input.id,
        }),
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    return AerodromeMapper.toApiRow(entity);
  }
}
