import { Injectable } from '@nestjs/common';

import type { Prisma } from '@/generated/prisma/client';

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
    const data: Prisma.AerodromeFeedbackCreateInput = {
      operationalAerodrome: {
        connect: { id: dto.operationalAerodromeId },
      },
      rating: dto.rating,
      comment: dto.comment,
      sessionHash: dto.sessionHash,
      feedbackDate: dto.feedbackDate,
      createdBy: dto.createdBy,
    };

    const created = await this.repo.create(data);
    return AerodromeFeedbackMapper.toApiRow(created);
  }
}
