import { HttpStatus, Injectable } from '@nestjs/common';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { ErrorCode } from '@/common/enums/error-code.enum';

import { FeedbackResponseDTO } from '../dtos/feedback-response.dto';
import { FeedbackMapper } from '../mappers/feedback.mapper';
import { FeedbackRepository } from '../repositories/feedback.repository';

export type FindFeedbackByIdServiceInput = { id: string };

@Injectable()
export class FindFeedbackByIdService {
  constructor(
    private readonly repo: FeedbackRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    input: FindFeedbackByIdServiceInput,
  ): Promise<FeedbackResponseDTO> {
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
    return FeedbackMapper.toApiRow(entity);
  }
}
