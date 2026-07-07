import type { Maintenance } from '@/generated/prisma/client';

import { maintenanceAuditSnapshot } from './maintenance-audit';

/** Monta um `Maintenance` mínimo com segredos que NÃO podem vazar no snapshot. */
const maintenance = {
  id: 'm1',
  name: 'Plano',
  aerodromeId: 'a1',
  securityCode: 'SECRET12',
  authorizedEmails: ['a@x.com', 'b@x.com'],
} as unknown as Maintenance;

describe('maintenanceAuditSnapshot', () => {
  it('projeta apenas campos identificadores e a contagem de e-mails', () => {
    expect(maintenanceAuditSnapshot(maintenance)).toEqual({
      id: 'm1',
      name: 'Plano',
      aerodromeId: 'a1',
      authorizedEmailsCount: 2,
    });
  });

  it('nunca expõe securityCode nem e-mails em claro', () => {
    const snapshot = maintenanceAuditSnapshot(maintenance);

    expect(snapshot).not.toHaveProperty('securityCode');
    expect(snapshot).not.toHaveProperty('authorizedEmails');
    expect(JSON.stringify(snapshot)).not.toContain('SECRET12');
    expect(JSON.stringify(snapshot)).not.toContain('a@x.com');
  });
});
