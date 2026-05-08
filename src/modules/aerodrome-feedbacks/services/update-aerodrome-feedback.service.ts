import { HttpStatus, Injectable } from '@nestjs/common';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { ErrorCode } from '@/common/enums/error-code.enum';

import { AerodromeFeedbackResponseDTO } from '../dtos/aerodrome-feedback-response.dto';
import { UpdateAerodromeFeedbackDTO } from '../dtos/update-aerodrome-feedback.dto';
import { AerodromeFeedbackMapper } from '../mappers/aerodrome-feedback.mapper';
import { patchAerodromeFeedbackToPrisma } from '../mappers/aerodrome-feedback.prisma.mapper';
import { AerodromeFeedbackRepository } from '../repositories/aerodrome-feedback.repository';

export type UpdateAerodromeFeedbackServiceInput = UpdateAerodromeFeedbackDTO & {
  id: string;
};

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
    const updated = await this.repo.update(
      id,
      patchAerodromeFeedbackToPrisma(dto),
    );
    return AerodromeFeedbackMapper.toApiRow(updated);
  }
}
