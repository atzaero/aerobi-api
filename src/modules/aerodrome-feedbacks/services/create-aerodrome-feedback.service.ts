import { Injectable } from '@nestjs/common';

import { AerodromeFeedbackResponseDTO } from '../dtos/aerodrome-feedback-response.dto';
import { CreateAerodromeFeedbackDTO } from '../dtos/create-aerodrome-feedback.dto';
import { AerodromeFeedbackMapper } from '../mappers/aerodrome-feedback.mapper';
import { AerodromeFeedbackRepository } from '../repositories/aerodrome-feedback.repository';

@Injectable()
export class CreateAerodromeFeedbackService {
  constructor(private readonly repo: AerodromeFeedbackRepository) {}

  async execute(
    dto: CreateAerodromeFeedbackDTO,
  ): Promise<AerodromeFeedbackResponseDTO> {
    // TODO: implementar
    const created = await this.repo.create(dto as never);
    return AerodromeFeedbackMapper.toApiRow(created);
  }
}
