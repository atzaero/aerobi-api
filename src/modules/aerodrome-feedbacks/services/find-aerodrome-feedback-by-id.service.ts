import { HttpStatus, Injectable } from '@nestjs/common';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { ErrorCode } from '@/common/enums/error-code.enum';

import { AerodromeFeedbackResponseDTO } from '../dtos/aerodrome-feedback-response.dto';
import { AerodromeFeedbackMapper } from '../mappers/aerodrome-feedback.mapper';
import { AerodromeFeedbackRepository } from '../repositories/aerodrome-feedback.repository';

export type FindAerodromeFeedbackByIdServiceInput = { id: string };

@Injectable()
export class FindAerodromeFeedbackByIdService {
  constructor(
    private readonly repo: AerodromeFeedbackRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    input: FindAerodromeFeedbackByIdServiceInput,
  ): Promise<AerodromeFeedbackResponseDTO> {
    const entity = await this.repo.findById(input.id);
    if (!entity) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
          RESOURCE: 'Feedback de aeródromo',
          ID: input.id,
        }),
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    return AerodromeFeedbackMapper.toApiRow(entity);
  }
}
