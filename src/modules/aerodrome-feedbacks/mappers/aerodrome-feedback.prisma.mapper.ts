import type { Prisma } from '@/generated/prisma/client';

import { CreateAerodromeFeedbackDTO } from '../dtos/create-aerodrome-feedback.dto';
import { UpdateAerodromeFeedbackDTO } from '../dtos/update-aerodrome-feedback.dto';

export function buildAerodromeFeedbackCreateInput(
  dto: CreateAerodromeFeedbackDTO,
): Prisma.AerodromeFeedbackCreateInput {
  return {
    operationalAerodrome: {
      connect: { id: dto.operationalAerodromeId },
    },
    rating: dto.rating,
    comment: dto.comment,
    sessionHash: dto.sessionHash,
    feedbackDate: dto.feedbackDate,
    createdBy: dto.createdBy,
  };
}

export function patchAerodromeFeedbackToPrisma(
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
