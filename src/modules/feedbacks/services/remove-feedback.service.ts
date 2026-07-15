import { HttpStatus, Injectable } from '@nestjs/common';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { ErrorCode } from '@/common/enums/error-code.enum';

import { FeedbackResponseDTO } from '../dtos/feedback-response.dto';
import { FeedbackMapper } from '../mappers/feedback.mapper';
import { FeedbackRepository } from '../repositories/feedback.repository';

export type RemoveFeedbackServiceInput = {
  id: string;
  deletedBy: string;
};

@Injectable()
export class RemoveFeedbackService {
  constructor(
    private readonly repo: FeedbackRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    input: RemoveFeedbackServiceInput,
  ): Promise<FeedbackResponseDTO> {
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
    return FeedbackMapper.toApiRow(deleted);
  }
}
