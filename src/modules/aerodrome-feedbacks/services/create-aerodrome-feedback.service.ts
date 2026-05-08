import { Injectable } from '@nestjs/common';

import { AerodromeFeedbackResponseDTO } from '../dtos/aerodrome-feedback-response.dto';
import { CreateAerodromeFeedbackDTO } from '../dtos/create-aerodrome-feedback.dto';
import { AerodromeFeedbackMapper } from '../mappers/aerodrome-feedback.mapper';
import { buildAerodromeFeedbackCreateInput } from '../mappers/aerodrome-feedback.prisma.mapper';
import { AerodromeFeedbackRepository } from '../repositories/aerodrome-feedback.repository';

@Injectable()
export class CreateAerodromeFeedbackService {
  constructor(private readonly repo: AerodromeFeedbackRepository) {}

  async execute(
    dto: CreateAerodromeFeedbackDTO,
  ): Promise<AerodromeFeedbackResponseDTO> {
    const created = await this.repo.create(
      buildAerodromeFeedbackCreateInput(dto),
    );
    return AerodromeFeedbackMapper.toApiRow(created);
  }
}
