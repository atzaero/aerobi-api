import { FeedbackRating } from '@/generated/prisma/client';

import type { CreateAerodromeFeedbackDTO } from '../dtos/create-aerodrome-feedback.dto';

import {
  buildAerodromeFeedbackCreateInput,
  patchAerodromeFeedbackToPrisma,
} from './aerodrome-feedback.prisma.mapper';

describe('aerodrome-feedback prisma mapper', () => {
  const aid = 'c3d4e5f6-a7b8-9012-cdef-345678901234';

  const createDto = (): CreateAerodromeFeedbackDTO => ({
    operationalAerodromeId: aid,
    rating: FeedbackRating.POSITIVE,
    comment: 'Ótimo',
    sessionHash: 'h1',
    feedbackDate: new Date('2024-01-05T15:00:00.000Z'),
  });

  it('create conecta operationalAerodrome', () => {
    expect(
      buildAerodromeFeedbackCreateInput(createDto()).operationalAerodrome,
    ).toEqual({ connect: { id: aid } });
  });

  it('patch com operationalAerodromeId gera connect', () => {
    const other = 'd4e5f6a7-b8c9-0123-def4-567890123456';
    expect(
      patchAerodromeFeedbackToPrisma({ operationalAerodromeId: other }),
    ).toEqual({
      operationalAerodrome: { connect: { id: other } },
    });
  });
});
