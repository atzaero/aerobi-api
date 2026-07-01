import { FeedbackRating } from '@/generated/prisma/client';

import {
  type AerodromeFeedbackCreateData,
  buildAerodromeFeedbackCreateInput,
} from './aerodrome-feedback.prisma.mapper';

describe('aerodrome-feedback prisma mapper', () => {
  const aid = 'c3d4e5f6-a7b8-9012-cdef-345678901234';

  const createData = (): AerodromeFeedbackCreateData => ({
    aerodromeId: aid,
    rating: FeedbackRating.POSITIVE,
    comment: 'Ótimo',
    sessionHash: 'h1',
    feedbackDate: new Date('2024-01-05T00:00:00.000Z'),
  });

  it('conecta o aeródromo via connect', () => {
    expect(buildAerodromeFeedbackCreateInput(createData()).aerodrome).toEqual({
      connect: { id: aid },
    });
  });

  it('createdBy é sempre null (envio anônimo)', () => {
    expect(
      buildAerodromeFeedbackCreateInput(createData()).createdBy,
    ).toBeNull();
  });

  it('comment ausente vira null', () => {
    const { comment, ...rest } = createData();
    void comment;
    expect(buildAerodromeFeedbackCreateInput(rest).comment).toBeNull();
  });

  it('comment vazio (só espaços trimados) também vira null', () => {
    expect(
      buildAerodromeFeedbackCreateInput({ ...createData(), comment: '' })
        .comment,
    ).toBeNull();
  });
});
