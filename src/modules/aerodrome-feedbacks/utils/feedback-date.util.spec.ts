import { resolveFeedbackDate } from './feedback-date.util';

describe('resolveFeedbackDate', () => {
  it('trunca para a meia-noite UTC do dia informado', () => {
    const out = resolveFeedbackDate(new Date('2026-06-15T18:42:07.123Z'));
    expect(out.toISOString()).toBe('2026-06-15T00:00:00.000Z');
  });

  it('usa o dia UTC (não o local) mesmo perto da virada', () => {
    const out = resolveFeedbackDate(new Date('2026-06-15T23:59:59.999Z'));
    expect(out.toISOString()).toBe('2026-06-15T00:00:00.000Z');
  });
});
