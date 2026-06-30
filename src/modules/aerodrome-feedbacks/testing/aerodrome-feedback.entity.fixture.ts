import type { AerodromeFeedback } from '@/generated/prisma/client';
import { FeedbackRating } from '@/generated/prisma/client';

const t = new Date('2024-06-01T12:00:00.000Z');
const feedbackDate = new Date('2024-05-15T00:00:00.000Z');

export function buildAerodromeFeedbackFixture(
  overrides: Partial<AerodromeFeedback> = {},
): AerodromeFeedback {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    aerodromeId: '22222222-2222-4222-8222-222222222222',
    rating: FeedbackRating.POSITIVE,
    comment: null,
    sessionHash: 'sess-1',
    feedbackDate,
    createdAt: t,
    createdBy: null,
    updatedAt: t,
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  };
}
