import { HttpStatus, Injectable } from '@nestjs/common';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { ErrorCode } from '@/common/enums/error-code.enum';

import { AerodromeFeedbackResponseDTO } from '../dtos/aerodrome-feedback-response.dto';
import { AerodromeFeedbackMapper } from '../mappers/aerodrome-feedback.mapper';
import { AerodromeFeedbackRepository } from '../repositories/aerodrome-feedback.repository';

export type RemoveAerodromeFeedbackServiceInput = {
  id: string;
  deletedBy: string;
};

@Injectable()
export class RemoveAerodromeFeedbackService {
  constructor(
    private readonly repo: AerodromeFeedbackRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    input: RemoveAerodromeFeedbackServiceInput,
  ): Promise<AerodromeFeedbackResponseDTO> {
    const existing = await this.repo.findById(input.id);
    if (!existing) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
          RESOURCE: 'Feedback de aeródromo',
          ID: input.id,
        }),
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    const deleted = await this.repo.softDelete(input.id, input.deletedBy);
    return AerodromeFeedbackMapper.toApiRow(deleted);
  }
}
