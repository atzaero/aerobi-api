import {
  normalizeNotamItems,
  ParsedNotamXml,
} from './notam-xml-normalize.util';

describe('normalizeNotamItems', () => {
  it('retorna total=0 e array vazio quando parsed é vazio', () => {
    expect(normalizeNotamItems({})).toEqual({
      total: 0,
      updatedat: undefined,
      rawItems: [],
    });
  });

  it('retorna total=0 quando aisweb.notam está ausente', () => {
    const parsed: ParsedNotamXml = { aisweb: {} };
    expect(normalizeNotamItems(parsed)).toEqual({
      total: 0,
      updatedat: undefined,
      rawItems: [],
    });
  });

  it('parseia total do atributo @_total como string', () => {
    const parsed: ParsedNotamXml = {
      aisweb: { notam: { '@_total': '7' } },
    };
    expect(normalizeNotamItems(parsed).total).toBe(7);
  });

  it('parseia total do atributo @_total como number', () => {
    const parsed: ParsedNotamXml = {
      aisweb: { notam: { '@_total': 3 } },
    };
    expect(normalizeNotamItems(parsed).total).toBe(3);
  });

  it('extrai updatedat do atributo @_updatedat', () => {
    const parsed: ParsedNotamXml = {
      aisweb: {
        notam: { '@_total': '1', '@_updatedat': '2026-04-06T10:00:00Z' },
      },
    };
    expect(normalizeNotamItems(parsed).updatedat).toBe('2026-04-06T10:00:00Z');
  });

  it('envolve único item em array', () => {
    const parsed: ParsedNotamXml = {
      aisweb: {
        notam: {
          '@_total': '1',
          item: { '@_id': '12345', loc: 'SBGR', status: 'N' },
        },
      },
    };
    const { rawItems } = normalizeNotamItems(parsed);
    expect(rawItems).toHaveLength(1);
    const item = rawItems[0] as Record<string, string>;
    expect(item.id).toBe('12345');
    expect(item.loc).toBe('SBGR');
    expect(item.status).toBe('N');
  });

  it('preserva array de múltiplos itens', () => {
    const parsed: ParsedNotamXml = {
      aisweb: {
        notam: {
          '@_total': '2',
          item: [
            { '@_id': '1', loc: 'SBGR' },
            { '@_id': '2', loc: 'SBBR' },
          ],
        },
      },
    };
    const { rawItems } = normalizeNotamItems(parsed);
    expect(rawItems).toHaveLength(2);
    expect((rawItems[0] as Record<string, string>).id).toBe('1');
    expect((rawItems[1] as Record<string, string>).id).toBe('2');
  });

  it('extrai CDATA de campos com formato fast-xml-parser v5', () => {
    const parsed: ParsedNotamXml = {
      aisweb: {
        notam: {
          '@_total': '1',
          item: {
            loc: [{ '#text': 'SBSP' }],
            status: [{ '#text': 'N' }],
          },
        },
      },
    };
    const { rawItems } = normalizeNotamItems(parsed);
    const item = rawItems[0] as Record<string, string>;
    expect(item.loc).toBe('SBSP');
    expect(item.status).toBe('N');
  });

  it('mapeia @_id do item para campo id no output', () => {
    const parsed: ParsedNotamXml = {
      aisweb: {
        notam: {
          '@_total': '1',
          item: { '@_id': '9999', n: 'A0123/26' },
        },
      },
    };
    const { rawItems } = normalizeNotamItems(parsed);
    const item = rawItems[0] as Record<string, string>;
    expect(item.id).toBe('9999');
    expect(item.n).toBe('A0123/26');
  });

  it('retorna rawItems vazio quando não há item mesmo com total > 0', () => {
    const parsed: ParsedNotamXml = {
      aisweb: { notam: { '@_total': '5' } },
    };
    expect(normalizeNotamItems(parsed).rawItems).toEqual([]);
  });
});
