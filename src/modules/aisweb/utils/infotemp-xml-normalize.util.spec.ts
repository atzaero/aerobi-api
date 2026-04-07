import {
  normalizeInfotempItems,
  ParsedInfotempXml,
} from './infotemp-xml-normalize.util';

describe('normalizeInfotempItems', () => {
  it('retorna total=0 e array vazio quando parsed é vazio', () => {
    expect(normalizeInfotempItems({})).toEqual({ total: 0, rawItems: [] });
  });

  it('retorna total=0 quando aisweb.infotemp está ausente', () => {
    const parsed: ParsedInfotempXml = { aisweb: {} };
    expect(normalizeInfotempItems(parsed)).toEqual({ total: 0, rawItems: [] });
  });

  it('parseia total numérico do atributo @_total (string)', () => {
    const parsed: ParsedInfotempXml = {
      aisweb: { infotemp: { '@_total': '3', item: [] } },
    };
    const { total } = normalizeInfotempItems(parsed);
    expect(total).toBe(3);
  });

  it('parseia total numérico do atributo @_total (number)', () => {
    const parsed: ParsedInfotempXml = {
      aisweb: { infotemp: { '@_total': 5, item: [] } },
    };
    const { total } = normalizeInfotempItems(parsed);
    expect(total).toBe(5);
  });

  it('envolve único item em array', () => {
    const parsed: ParsedInfotempXml = {
      aisweb: {
        infotemp: {
          '@_total': '1',
          item: {
            number: '905',
            rmk: 'Obs',
            action: 'A',
            startdate: '2026-01-01',
            enddate: '2026-12-31',
            dt: '2026-01-01',
          },
        },
      },
    };
    const { rawItems } = normalizeInfotempItems(parsed);
    expect(rawItems).toHaveLength(1);
    expect(rawItems[0]).toMatchObject({ number: '905', rmk: 'Obs' });
  });

  it('preserva array de múltiplos itens', () => {
    const parsed: ParsedInfotempXml = {
      aisweb: {
        infotemp: {
          '@_total': '2',
          item: [
            { number: '100', rmk: 'A' },
            { number: '200', rmk: 'B' },
          ],
        },
      },
    };
    const { rawItems } = normalizeInfotempItems(parsed);
    expect(rawItems).toHaveLength(2);
  });

  it('strip do literal SQL {ts ...} nos campos de data', () => {
    const parsed: ParsedInfotempXml = {
      aisweb: {
        infotemp: {
          '@_total': '1',
          item: {
            number: '905',
            rmk: '',
            action: '',
            startdate: "{ts '2023-03-27 00:00:00'}",
            enddate: "{ts '2024-06-15 12:00:00'}",
            dt: "{ts '2024-06-15 12:00:00'}",
          },
        },
      },
    };
    const { rawItems } = normalizeInfotempItems(parsed);
    const item = rawItems[0] as Record<string, string>;
    expect(item.startdate).toBe('2023-03-27 00:00:00');
    expect(item.enddate).toBe('2024-06-15 12:00:00');
    expect(item.dt).toBe('2024-06-15 12:00:00');
  });

  it('extrai CDATA de campos com formato fast-xml-parser v5', () => {
    const parsed: ParsedInfotempXml = {
      aisweb: {
        infotemp: {
          '@_total': '1',
          item: {
            number: [{ '#text': '905' }],
            rmk: [{ '#text': 'Observação de teste' }],
          },
        },
      },
    };
    const { rawItems } = normalizeInfotempItems(parsed);
    const item = rawItems[0] as Record<string, string>;
    expect(item.number).toBe('905');
    expect(item.rmk).toBe('Observação de teste');
  });

  it('usa campos diretos de infotemp quando não há item e total > 0', () => {
    const parsed: ParsedInfotempXml = {
      aisweb: {
        infotemp: {
          '@_total': '1',
          number: '42',
          rmk: 'Direto',
          action: '',
          startdate: '2026-01-01',
          enddate: '2026-12-31',
          dt: '2026-01-01',
        },
      },
    };
    const { total, rawItems } = normalizeInfotempItems(parsed);
    expect(total).toBe(1);
    expect(rawItems).toHaveLength(1);
    expect((rawItems[0] as Record<string, string>).number).toBe('42');
  });
});
