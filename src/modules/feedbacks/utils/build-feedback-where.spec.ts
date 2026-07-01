import type { UserGroupScope } from '@/common/utils/group-scope.util';
import { FeedbackRating } from '@/generated/prisma/client';

import { buildFeedbackScopedWhere } from './build-feedback-where';

const ALL: UserGroupScope = { kind: 'all' };
const GROUP: UserGroupScope = { kind: 'group', groupId: 'g-1' };
const NONE: UserGroupScope = { kind: 'none' };

describe('buildFeedbackScopedWhere', () => {
  it('escopo none → fail-closed (id in [])', () => {
    expect(buildFeedbackScopedWhere({}, NONE)).toEqual({
      id: { in: [] },
    });
  });

  it('escopo all → sem restrição de grupo', () => {
    expect(buildFeedbackScopedWhere({}, ALL)).toEqual({});
  });

  it('escopo group → restringe via aerodrome.groupId', () => {
    expect(buildFeedbackScopedWhere({}, GROUP)).toEqual({
      aerodrome: { groupId: 'g-1' },
    });
  });

  it('aplica filtros de aeródromo e rating', () => {
    const aid = '22222222-2222-4222-8222-222222222222';
    expect(
      buildFeedbackScopedWhere(
        { aerodromeId: aid, rating: FeedbackRating.POSITIVE },
        ALL,
      ),
    ).toEqual({ aerodromeId: aid, rating: FeedbackRating.POSITIVE });
  });

  it('intervalo de data (gte/lte, meia-noite UTC, inclusivo)', () => {
    expect(
      buildFeedbackScopedWhere(
        { startDate: '2026-01-01', endDate: '2026-01-31' },
        ALL,
      ),
    ).toEqual({
      feedbackDate: {
        gte: new Date('2026-01-01T00:00:00.000Z'),
        lte: new Date('2026-01-31T00:00:00.000Z'),
      },
    });
  });

  it('só startDate → apenas gte', () => {
    expect(buildFeedbackScopedWhere({ startDate: '2026-02-10' }, ALL)).toEqual({
      feedbackDate: { gte: new Date('2026-02-10T00:00:00.000Z') },
    });
  });

  it('filtros + escopo group coexistem (AND implícito)', () => {
    expect(
      buildFeedbackScopedWhere({ rating: FeedbackRating.NEGATIVE }, GROUP),
    ).toEqual({
      rating: FeedbackRating.NEGATIVE,
      aerodrome: { groupId: 'g-1' },
    });
  });
});
