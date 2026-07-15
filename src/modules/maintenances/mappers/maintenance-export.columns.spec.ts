import type { MaintenanceTask } from '@/generated/prisma/client';

import {
  decimalToNumber,
  maintenanceExportColumns,
  type MaintenanceExportRow,
} from './maintenance-export.columns';

/** Simula um `Decimal` do Prisma expondo apenas `toNumber`. */
const decimal = (n: number) =>
  ({ toNumber: () => n }) as unknown as MaintenanceTask['predictedValue'];

describe('maintenanceExportColumns', () => {
  const row: MaintenanceExportRow = {
    name: 'Reforma',
    aerodromeId: 'a1',
    uf: 'PI',
    authorizedEmails: ['a@x.com', 'b@x.com'],
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  it('mantém a ordem e os cabeçalhos das colunas', () => {
    expect(maintenanceExportColumns.map((c) => c.header)).toEqual([
      'Nome da intervenção',
      'Aeródromo (ID)',
      'UF',
      'E-mails autorizados',
      'Criado em (UTC)',
    ]);
  });

  it('projeta os valores da linha via accessors', () => {
    const values = maintenanceExportColumns.map((c) => c.accessor(row));
    expect(values).toEqual([
      'Reforma',
      'a1',
      'PI',
      'a@x.com; b@x.com',
      '2026-01-01T00:00:00.000Z',
    ]);
  });

  it('usa o fallback "Intervenção sem nome" quando o nome é vazio', () => {
    expect(maintenanceExportColumns[0].accessor({ ...row, name: '   ' })).toBe(
      'Intervenção sem nome',
    );
  });

  it('retorna string vazia quando createdAt é null', () => {
    expect(
      maintenanceExportColumns[4].accessor({ ...row, createdAt: null }),
    ).toBe('');
  });
});

describe('decimalToNumber', () => {
  it('retorna 0 para null/undefined', () => {
    expect(decimalToNumber(null)).toBe(0);
    expect(decimalToNumber(undefined)).toBe(0);
  });

  it('converte Decimal finito em número', () => {
    expect(decimalToNumber(decimal(1234.56))).toBe(1234.56);
  });

  it('retorna 0 para valores não finitos', () => {
    expect(decimalToNumber(decimal(Number.POSITIVE_INFINITY))).toBe(0);
    expect(decimalToNumber(decimal(Number.NaN))).toBe(0);
  });
});
