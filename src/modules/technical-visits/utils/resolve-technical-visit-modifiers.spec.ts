import { mapTechnicalVisitModifiers } from './resolve-technical-visit-modifiers';

describe('mapTechnicalVisitModifiers', () => {
  const at = new Date('2024-06-01T12:00:00.000Z');
  const users = new Map([
    [
      '33333333-3333-4333-8333-333333333333',
      {
        id: '33333333-3333-4333-8333-333333333333',
        name: 'Actor',
        email: 'actor@test.com',
      },
    ],
  ]);

  it('projeta date alinhado ao índice de modifierAtTimes', () => {
    const rows = mapTechnicalVisitModifiers(
      ['33333333-3333-4333-8333-333333333333'],
      [at],
      users,
    );
    expect(rows[0].date).toBe(at.toISOString());
    expect(rows[0].name).toBe('Actor');
  });

  it('date null quando histórico legado não tem timestamp', () => {
    const rows = mapTechnicalVisitModifiers(
      ['33333333-3333-4333-8333-333333333333'],
      [],
      users,
    );
    expect(rows[0].date).toBeNull();
  });
});
