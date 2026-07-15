import { GuessStatus } from '@/generated/prisma/client';

import { guessAuditSnapshot } from './guess-audit';

describe('guessAuditSnapshot', () => {
  it('projeta apenas id e status', () => {
    const snapshot = guessAuditSnapshot({
      id: 'g1',
      status: GuessStatus.PENDING,
    });

    expect(snapshot).toEqual({ id: 'g1', status: GuessStatus.PENDING });
  });

  it('não vaza PII (email) nem conteúdo (text) do palpite', () => {
    const guess = {
      id: 'g1',
      status: GuessStatus.CONSIDERED,
      email: 'piloto@example.com',
      text: 'instalar cerca no aeródromo',
      taskId: 'task-1',
      createdBy: 'someone',
    };

    const snapshot = guessAuditSnapshot(guess);

    expect(snapshot).not.toHaveProperty('email');
    expect(snapshot).not.toHaveProperty('text');
    expect(Object.keys(snapshot)).toEqual(['id', 'status']);
    expect(JSON.stringify(snapshot)).not.toContain('piloto@example.com');
    expect(JSON.stringify(snapshot)).not.toContain('instalar cerca');
  });

  it('preserva cada valor de status', () => {
    expect(
      guessAuditSnapshot({ id: 'a', status: GuessStatus.DISMISSED }),
    ).toEqual({ id: 'a', status: GuessStatus.DISMISSED });
  });
});
