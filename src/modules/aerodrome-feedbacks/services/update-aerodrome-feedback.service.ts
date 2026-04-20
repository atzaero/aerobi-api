import { Injectable, NotFoundException } from '@nestjs/common';

import { AerodromeFeedbackResponseDTO } from '../dtos/aerodrome-feedback-response.dto';
import { UpdateAerodromeFeedbackDTO } from '../dtos/update-aerodrome-feedback.dto';
import { AerodromeFeedbackMapper } from '../mappers/aerodrome-feedback.mapper';
import { AerodromeFeedbackRepository } from '../repositories/aerodrome-feedback.repository';

export type UpdateAerodromeFeedbackServiceInput = UpdateAerodromeFeedbackDTO & {
  id: string;
};

@Injectable()
export class UpdateAerodromeFeedbackService {
  constructor(private readonly repo: AerodromeFeedbackRepository) {}

  async execute(
    input: UpdateAerodromeFeedbackServiceInput,
  ): Promise<AerodromeFeedbackResponseDTO> {
    // TODO: implementar
    const { id, ...data } = input;
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundException(`AerodromeFeedback ${id} not found`);
    }
    const updated = await this.repo.update(id, data as never);
    return AerodromeFeedbackMapper.toApiRow(updated);
  }
}
