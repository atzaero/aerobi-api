import { CreateMaintenanceDTO } from '../dtos/create-maintenance.dto';
import { UpdateMaintenanceDTO } from '../dtos/update-maintenance.dto';

import {
  buildMaintenanceCreateInput,
  buildMaintenanceUpdateInput,
} from './maintenance.prisma.mapper';

/** Formato do código gerado por `generateSecurityCode` (maiúsculas + 2-9). */
const SECURITY_CODE_RE = /^[A-Z2-9]{8}$/;

describe('buildMaintenanceCreateInput', () => {
  it('normaliza nome/e-mails e gera código quando há autorizados', () => {
    const dto: CreateMaintenanceDTO = {
      name: '  Plano A  ',
      aerodromeId: 'a1',
      authorizedEmails: ['A@x.com', 'a@x.com'],
    };

    const result = buildMaintenanceCreateInput({
      dto,
      actorId: 'actor-1',
      aerodromeId: 'a1',
    });

    expect(result.name).toBe('Plano A');
    expect(result.authorizedEmails).toEqual(['A@x.com']);
    expect(result.securityCode).toMatch(SECURITY_CODE_RE);
    expect(result.aerodrome).toEqual({ connect: { id: 'a1' } });
    expect(result.createdBy).toBe('actor-1');
    expect(result.updatedBy).toBe('actor-1');
  });

  it('mantém securityCode null quando não há e-mails autorizados', () => {
    const dto: CreateMaintenanceDTO = {
      name: 'X',
      aerodromeId: 'a1',
      authorizedEmails: [],
    };

    const result = buildMaintenanceCreateInput({
      dto,
      actorId: 'actor-1',
      aerodromeId: 'a1',
    });

    expect(result.securityCode).toBeNull();
    expect(result.authorizedEmails).toEqual([]);
  });
});

describe('buildMaintenanceUpdateInput', () => {
  const base = { actorId: 'actor-1' };

  it('zera o código quando os e-mails ficam vazios', () => {
    const dto: UpdateMaintenanceDTO = { name: 'X', authorizedEmails: [] };

    const result = buildMaintenanceUpdateInput({
      ...base,
      dto,
      currentSecurityCode: 'OLDCODE1',
      regenerateSecurityCode: false,
    });

    expect(result.securityCode).toBeNull();
    expect(result.authorizedEmails).toEqual([]);
    expect(result.updatedBy).toBe('actor-1');
  });

  it('regenera o código quando regenerateSecurityCode=true', () => {
    const dto: UpdateMaintenanceDTO = {
      name: 'X',
      authorizedEmails: ['a@x.com'],
    };

    const result = buildMaintenanceUpdateInput({
      ...base,
      dto,
      currentSecurityCode: 'OLDCODE1',
      regenerateSecurityCode: true,
    });

    expect(result.securityCode).toMatch(SECURITY_CODE_RE);
    expect(result.securityCode).not.toBe('OLDCODE1');
  });

  it('regenera o código quando o legado está vazio', () => {
    const dto: UpdateMaintenanceDTO = {
      name: 'X',
      authorizedEmails: ['a@x.com'],
    };

    const result = buildMaintenanceUpdateInput({
      ...base,
      dto,
      currentSecurityCode: '',
      regenerateSecurityCode: false,
    });

    expect(result.securityCode).toMatch(SECURITY_CODE_RE);
  });

  it('preserva o código atual quando há e-mails e não se pede regeneração', () => {
    const dto: UpdateMaintenanceDTO = {
      name: '  Plano  ',
      authorizedEmails: ['A@x.com', 'a@x.com'],
    };

    const result = buildMaintenanceUpdateInput({
      ...base,
      dto,
      currentSecurityCode: 'OLDCODE1',
      regenerateSecurityCode: false,
    });

    expect(result.securityCode).toBe('OLDCODE1');
    expect(result.name).toBe('Plano');
    expect(result.authorizedEmails).toEqual(['A@x.com']);
  });
});
