import { buildAerodromeWithGroupFixture } from '../testing/aerodrome.entity.fixture';

import { aerodromeExportColumns } from './aerodrome-export.columns';

describe('aerodromeExportColumns', () => {
  it('tem as 11 colunas do web, na ordem', () => {
    expect(aerodromeExportColumns.map((c) => c.header)).toEqual([
      'ICAO',
      'Nome',
      'Município',
      'UF',
      'Grupo',
      'Aberto',
      'Visível',
      'Meteorologia',
      'Balizado',
      'Abastecimento',
      'Criado em (UTC)',
    ]);
  });

  it('acessores: UF do grupo, Grupo=groupId, Sim/Não (null→Não), município vazio', () => {
    const entity = buildAerodromeWithGroupFixture({
      icao: 'SBSP',
      municipality: null,
      isOpen: true,
      isView: false,
      weatherStationDisplay: true,
      lit: false,
      fueling: null,
    });
    const val = (header: string): string => {
      const col = aerodromeExportColumns.find((c) => c.header === header);
      if (!col) throw new Error(`coluna ausente: ${header}`);
      return String(col.accessor(entity));
    };

    expect(val('ICAO')).toBe('SBSP');
    expect(val('Município')).toBe('');
    expect(val('UF')).toBe('PI');
    expect(val('Grupo')).toBe(entity.groupId);
    expect(val('Aberto')).toBe('Sim');
    expect(val('Visível')).toBe('Não');
    expect(val('Meteorologia')).toBe('Sim');
    expect(val('Balizado')).toBe('Não');
    expect(val('Abastecimento')).toBe('Não');
    expect(val('Criado em (UTC)')).toBe(entity.createdAt.toISOString());
  });
});
