import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { httpError } from '@/common/exceptions/http-error.util';
import { isUniqueConstraintError } from '@/common/utils/prisma-error.util';

import { FeedbackResponseDTO } from '../dtos/feedback-response.dto';
import { CreateFeedbackDTO } from '../dtos/create-feedback.dto';
import { FeedbackMapper } from '../mappers/feedback.mapper';
import { buildFeedbackCreateInput } from '../mappers/feedback.prisma.mapper';
import { FeedbackRepository } from '../repositories/feedback.repository';
import { resolveFeedbackDate } from '../utils/feedback-date.util';

/**
 * Envio público/anônimo de feedback. Valida a existência do aeródromo (404),
 * deriva `feedbackDate` (dia UTC) e `createdBy = null` no servidor, e traduz a
 * violação do rate-limit diário (`@@unique`, Prisma `P2002`) em 409.
 */
@Injectable()
export class CreateFeedbackService {
  constructor(
    private readonly repo: FeedbackRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(dto: CreateFeedbackDTO): Promise<FeedbackResponseDTO> {
    const aerodrome = await this.repo.findActiveAerodrome(dto.aerodromeId);
    if (!aerodrome) {
      throw httpError(
        this.errorMessageService,
        ErrorCode.RESOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { RESOURCE: 'Aeródromo', ID: dto.aerodromeId },
      );
    }

    try {
      const created = await this.repo.create(
        buildFeedbackCreateInput({
          aerodromeId: dto.aerodromeId,
          rating: dto.rating,
          comment: dto.comment,
          sessionHash: dto.sessionHash,
          feedbackDate: resolveFeedbackDate(),
        }),
      );
      return FeedbackMapper.toApiRow(created);
    } catch (err) {
      if (isUniqueConstraintError(err)) {
        throw httpError(
          this.errorMessageService,
          ErrorCode.FEEDBACK_DAILY_LIMIT_REACHED,
          HttpStatus.CONFLICT,
        );
      }
      throw err;
    }
  }
}
