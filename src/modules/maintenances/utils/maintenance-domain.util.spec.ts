import { diffAddedEmails } from './diff-added-emails';
import { normalizeAuthorizedEmails } from './normalize-authorized-emails';
import {
  isMaintenancePublicAccess,
  isTaskCurrentlyOverdue,
} from './maintenance-domain.util';

describe('normalizeAuthorizedEmails', () => {
  it('deduplica case-insensitive preservando a primeira grafia', () => {
    expect(
      normalizeAuthorizedEmails(['A@test.com', 'a@test.com', ' B@test.com ']),
    ).toEqual(['A@test.com', 'B@test.com']);
  });
});

describe('diffAddedEmails', () => {
  it('retorna apenas e-mails novos', () => {
    expect(
      diffAddedEmails(['a@test.com'], ['a@test.com', 'b@test.com']),
    ).toEqual(['b@test.com']);
  });
});

describe('isMaintenancePublicAccess', () => {
  it('exige e-mails e código', () => {
    expect(
      isMaintenancePublicAccess({
        authorizedEmails: ['a@test.com'],
        securityCode: 'CODE',
      }),
    ).toBe(true);
    expect(
      isMaintenancePublicAccess({ authorizedEmails: [], securityCode: 'CODE' }),
    ).toBe(false);
  });
});

describe('isTaskCurrentlyOverdue', () => {
  it('detecta pendente vencida', () => {
    expect(
      isTaskCurrentlyOverdue(
        {
          status: 'PENDING',
          predictedDate: new Date('2020-01-01T00:00:00.000Z'),
        },
        Date.parse('2026-01-01T00:00:00.000Z'),
      ),
    ).toBe(true);
  });
});
