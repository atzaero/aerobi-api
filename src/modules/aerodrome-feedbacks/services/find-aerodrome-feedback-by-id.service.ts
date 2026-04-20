import { Injectable, NotFoundException } from '@nestjs/common';

import { AerodromeFeedbackResponseDTO } from '../dtos/aerodrome-feedback-response.dto';
import { AerodromeFeedbackMapper } from '../mappers/aerodrome-feedback.mapper';
import { AerodromeFeedbackRepository } from '../repositories/aerodrome-feedback.repository';

export type FindAerodromeFeedbackByIdServiceInput = { id: string };

@Injectable()
export class FindAerodromeFeedbackByIdService {
  constructor(private readonly repo: AerodromeFeedbackRepository) {}

  async execute(
    input: FindAerodromeFeedbackByIdServiceInput,
  ): Promise<AerodromeFeedbackResponseDTO> {
    // TODO: implementar
    const entity = await this.repo.findById(input.id);
    if (!entity) {
      throw new NotFoundException(`AerodromeFeedback ${input.id} not found`);
    }
    return AerodromeFeedbackMapper.toApiRow(entity);
  }
}
