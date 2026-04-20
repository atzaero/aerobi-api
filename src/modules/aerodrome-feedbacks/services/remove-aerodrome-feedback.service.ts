import { Injectable, NotFoundException } from '@nestjs/common';

import { AerodromeFeedbackResponseDTO } from '../dtos/aerodrome-feedback-response.dto';
import { AerodromeFeedbackMapper } from '../mappers/aerodrome-feedback.mapper';
import { AerodromeFeedbackRepository } from '../repositories/aerodrome-feedback.repository';

export type RemoveAerodromeFeedbackServiceInput = {
  id: string;
  deletedBy: string;
};

@Injectable()
export class RemoveAerodromeFeedbackService {
  constructor(private readonly repo: AerodromeFeedbackRepository) {}

  async execute(
    input: RemoveAerodromeFeedbackServiceInput,
  ): Promise<AerodromeFeedbackResponseDTO> {
    // TODO: implementar (soft delete)
    const existing = await this.repo.findById(input.id);
    if (!existing) {
      throw new NotFoundException(`AerodromeFeedback ${input.id} not found`);
    }
    const deleted = await this.repo.softDelete(input.id, input.deletedBy);
    return AerodromeFeedbackMapper.toApiRow(deleted);
  }
}
