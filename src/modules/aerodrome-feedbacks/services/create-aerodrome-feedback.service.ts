import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { httpError } from '@/common/exceptions/http-error.util';
import { isUniqueConstraintError } from '@/common/utils/prisma-error.util';

import { AerodromeFeedbackResponseDTO } from '../dtos/aerodrome-feedback-response.dto';
import { CreateAerodromeFeedbackDTO } from '../dtos/create-aerodrome-feedback.dto';
import { AerodromeFeedbackMapper } from '../mappers/aerodrome-feedback.mapper';
import { buildAerodromeFeedbackCreateInput } from '../mappers/aerodrome-feedback.prisma.mapper';
import { AerodromeFeedbackRepository } from '../repositories/aerodrome-feedback.repository';
import { resolveFeedbackDate } from '../utils/feedback-date.util';

/**
 * Envio público/anônimo de feedback. Valida a existência do aeródromo (404),
 * deriva `feedbackDate` (dia UTC) e `createdBy = null` no servidor, e traduz a
 * violação do rate-limit diário (`@@unique`, Prisma `P2002`) em 409.
 */
@Injectable()
export class CreateAerodromeFeedbackService {
  constructor(
    private readonly repo: AerodromeFeedbackRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    dto: CreateAerodromeFeedbackDTO,
  ): Promise<AerodromeFeedbackResponseDTO> {
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
        buildAerodromeFeedbackCreateInput({
          aerodromeId: dto.aerodromeId,
          rating: dto.rating,
          comment: dto.comment,
          sessionHash: dto.sessionHash,
          feedbackDate: resolveFeedbackDate(),
        }),
      );
      return AerodromeFeedbackMapper.toApiRow(created);
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
