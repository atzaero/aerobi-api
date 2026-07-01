import { FeedbackRating } from '@/generated/prisma/client';

import {
  type FeedbackCreateData,
  buildFeedbackCreateInput,
} from './feedback.prisma.mapper';

describe('feedback prisma mapper', () => {
  const aid = 'c3d4e5f6-a7b8-9012-cdef-345678901234';

  const createData = (): FeedbackCreateData => ({
    aerodromeId: aid,
    rating: FeedbackRating.POSITIVE,
    comment: 'Ótimo',
    sessionHash: 'h1',
    feedbackDate: new Date('2024-01-05T00:00:00.000Z'),
  });

  it('conecta o aeródromo via connect', () => {
    expect(buildFeedbackCreateInput(createData()).aerodrome).toEqual({
      connect: { id: aid },
    });
  });

  it('createdBy é sempre null (envio anônimo)', () => {
    expect(buildFeedbackCreateInput(createData()).createdBy).toBeNull();
  });

  it('comment ausente vira null', () => {
    const { comment, ...rest } = createData();
    void comment;
    expect(buildFeedbackCreateInput(rest).comment).toBeNull();
  });

  it('comment vazio (só espaços trimados) também vira null', () => {
    expect(
      buildFeedbackCreateInput({ ...createData(), comment: '' }).comment,
    ).toBeNull();
  });
});
