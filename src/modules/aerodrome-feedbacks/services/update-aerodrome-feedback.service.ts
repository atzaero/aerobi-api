import { HttpStatus, Injectable } from '@nestjs/common';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { ErrorCode } from '@/common/enums/error-code.enum';
import type { Prisma } from '@/generated/prisma/client';

import { AerodromeFeedbackResponseDTO } from '../dtos/aerodrome-feedback-response.dto';
import { UpdateAerodromeFeedbackDTO } from '../dtos/update-aerodrome-feedback.dto';
import { AerodromeFeedbackMapper } from '../mappers/aerodrome-feedback.mapper';
import { AerodromeFeedbackRepository } from '../repositories/aerodrome-feedback.repository';

export type UpdateAerodromeFeedbackServiceInput = UpdateAerodromeFeedbackDTO & {
  id: string;
};

function patchToPrisma(
  dto: UpdateAerodromeFeedbackDTO,
): Prisma.AerodromeFeedbackUpdateInput {
  const data: Prisma.AerodromeFeedbackUpdateInput = {};
  if (dto.rating !== undefined) data.rating = dto.rating;
  if (dto.comment !== undefined) data.comment = dto.comment;
  if (dto.sessionHash !== undefined) data.sessionHash = dto.sessionHash;
  if (dto.feedbackDate !== undefined) data.feedbackDate = dto.feedbackDate;
  if (dto.operationalAerodromeId !== undefined) {
    data.operationalAerodrome = {
      connect: { id: dto.operationalAerodromeId },
    };
  }
  return data;
}

@Injectable()
export class UpdateAerodromeFeedbackService {
  constructor(
    private readonly repo: AerodromeFeedbackRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    input: UpdateAerodromeFeedbackServiceInput,
  ): Promise<AerodromeFeedbackResponseDTO> {
    const { id, ...dto } = input;
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
          RESOURCE: 'Feedback de aeródromo',
          ID: id,
        }),
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    const updated = await this.repo.update(id, patchToPrisma(dto));
    return AerodromeFeedbackMapper.toApiRow(updated);
  }
}
