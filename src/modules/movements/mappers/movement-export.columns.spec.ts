import type { MovementWithSnapshot } from './movement.mapper';
import { movementExportColumns } from './movement-export.columns';

describe('movementExportColumns', () => {
  const entity = (
    over: Partial<MovementWithSnapshot> = {},
  ): MovementWithSnapshot =>
    ({
      id: 'r-1',
      registration: 'PRZTT',
      readingDatetime: new Date('2026-06-08T16:52:39.000Z'),
      operationType: 'TAKEOFF',
      source: 'MANUAL',
      conformityStatus: 'NON_CONFORMANT',
      readingStatus: 'APPROVED',
      comments: 'sem intercorrências',
      aerodrome: 'SSCF',
      createdAt: new Date('2026-06-08T16:52:40.000Z'),
      ...over,
    }) as MovementWithSnapshot;

  const rowFor = (m: MovementWithSnapshot): Record<string, string> =>
    Object.fromEntries(
      movementExportColumns.map((c) => [c.header, String(c.accessor(m))]),
    );

  it('ordem e cabeçalhos espelham o CSV do aerobi-web', () => {
    expect(movementExportColumns.map((c) => c.header)).toEqual([
      'Matrícula',
      'Aeródromo',
      'Data/hora da leitura',
      'Tipo de operação',
      'Origem',
      'Conformidade',
      'Status',
      'Comentários',
      'Criado em',
    ]);
  });

  it('formata enums em pt-BR e datas em ISO 8601', () => {
    const row = rowFor(entity());
    expect(row['Matrícula']).toBe('PRZTT');
    expect(row['Aeródromo']).toBe('SSCF');
    expect(row['Data/hora da leitura']).toBe('2026-06-08T16:52:39.000Z');
    expect(row['Tipo de operação']).toBe('Decolagem');
    expect(row['Origem']).toBe('Manual');
    expect(row['Conformidade']).toBe('Não conforme');
    expect(row['Status']).toBe('APPROVED');
    expect(row['Comentários']).toBe('sem intercorrências');
    expect(row['Criado em']).toBe('2026-06-08T16:52:40.000Z');
  });

  it('campos opcionais nulos viram string vazia', () => {
    const row = rowFor(
      entity({
        aerodrome: null,
        readingStatus: null,
        comments: null,
      }),
    );
    expect(row['Aeródromo']).toBe('');
    expect(row['Status']).toBe('');
    expect(row['Comentários']).toBe('');
  });
});
