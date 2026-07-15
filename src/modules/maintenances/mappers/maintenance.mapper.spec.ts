import type { MaintenanceWithAerodrome } from '../repositories/maintenance.repository.interface';

import { MaintenanceMapper } from './maintenance.mapper';

/** Entidade base (só os campos que o mapper lê). */
const entity = {
  id: 'm1',
  name: 'Plano',
  aerodromeId: 'a1',
  securityCode: 'CODE1234',
  authorizedEmails: ['a@x.com', 'b@x.com'],
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-02T03:04:05.000Z'),
  aerodrome: { group: { uf: 'PI' } },
} as unknown as MaintenanceWithAerodrome;

describe('MaintenanceMapper.toApiRow', () => {
  it('mapeia campos, deriva uf do grupo e serializa datas em ISO', () => {
    expect(MaintenanceMapper.toApiRow(entity)).toEqual({
      id: 'm1',
      name: 'Plano',
      aerodromeId: 'a1',
      uf: 'PI',
      securityCode: 'CODE1234',
      authorizedEmails: ['a@x.com', 'b@x.com'],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T03:04:05.000Z',
    });
  });

  it('copia authorizedEmails para um novo array (sem compartilhar referência)', () => {
    const row = MaintenanceMapper.toApiRow(entity);
    expect(row.authorizedEmails).not.toBe(entity.authorizedEmails);
    expect(row.authorizedEmails).toEqual([...entity.authorizedEmails]);
  });
});

describe('MaintenanceMapper.toListItem', () => {
  it('inclui uf direta e as contagens de atraso', () => {
    const listEntity = {
      ...entity,
      uf: 'SP',
      overduePendingCount: 2,
      overdueCompletedCount: 1,
    };

    const row = MaintenanceMapper.toListItem(listEntity);

    expect(row.uf).toBe('SP');
    expect(row.overduePendingCount).toBe(2);
    expect(row.overdueCompletedCount).toBe(1);
    expect(row.createdAt).toBe('2026-01-01T00:00:00.000Z');
  });
});

describe('MaintenanceMapper.toListItems', () => {
  it('mapeia cada item da lista', () => {
    const rows = MaintenanceMapper.toListItems([
      { ...entity, uf: 'PI', overduePendingCount: 0, overdueCompletedCount: 0 },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe('m1');
  });
});

describe('MaintenanceMapper.toExportRow(s)', () => {
  it('projeta linha de export com createdAt como Date e uf do grupo', () => {
    expect(MaintenanceMapper.toExportRow(entity)).toEqual({
      name: 'Plano',
      aerodromeId: 'a1',
      uf: 'PI',
      authorizedEmails: ['a@x.com', 'b@x.com'],
      createdAt: entity.createdAt,
    });

    expect(MaintenanceMapper.toExportRows([entity])).toHaveLength(1);
  });
});
