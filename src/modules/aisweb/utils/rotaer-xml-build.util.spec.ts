import {
  xmlElementTextContent,
  unwrapOptionalNum,
  attrString,
  parseTaggedValue,
  collectLightEntriesFromLightsNodes,
  parseRmkTextNode,
  stripEmptyTagged,
  buildRotaerDto,
} from './rotaer-xml-build.util';

// ---------------------------------------------------------------------------
// xmlElementTextContent
// ---------------------------------------------------------------------------
describe('xmlElementTextContent', () => {
  it('retorna vazio para null/undefined', () => {
    expect(xmlElementTextContent(null)).toBe('');
    expect(xmlElementTextContent(undefined)).toBe('');
  });

  it('retorna string com trim aplicado', () => {
    expect(xmlElementTextContent('  SBGR  ')).toBe('SBGR');
  });

  it('converte número para string', () => {
    expect(xmlElementTextContent(42)).toBe('42');
  });

  it('extrai #text de objeto CDATA', () => {
    expect(xmlElementTextContent({ '#text': 'Guarulhos' })).toBe('Guarulhos');
  });

  it('extrai texto de array de objetos CDATA (v5)', () => {
    expect(xmlElementTextContent([{ '#text': 'São Paulo' }])).toBe('São Paulo');
  });

  it('ignora atributos @_ ao concatenar', () => {
    expect(xmlElementTextContent({ '@_cod': 'X', '#text': 'Valor' })).toBe(
      'Valor',
    );
  });

  it('retorna vazio para objeto sem #text e sem conteúdo texto', () => {
    expect(xmlElementTextContent({ '@_attr': 'apenas-atributo' })).toBe('');
  });
});

// ---------------------------------------------------------------------------
// unwrapOptionalNum
// ---------------------------------------------------------------------------
describe('unwrapOptionalNum', () => {
  it('retorna undefined para null/undefined/string vazia', () => {
    expect(unwrapOptionalNum(null)).toBeUndefined();
    expect(unwrapOptionalNum(undefined)).toBeUndefined();
    expect(unwrapOptionalNum('')).toBeUndefined();
  });

  it('converte string numérica para number', () => {
    expect(unwrapOptionalNum('2')).toBe(2);
    expect(unwrapOptionalNum('3.5')).toBe(3.5);
  });

  it('retorna número direto', () => {
    expect(unwrapOptionalNum(7)).toBe(7);
  });

  it('retorna undefined para string não numérica', () => {
    expect(unwrapOptionalNum('abc')).toBeUndefined();
  });

  it('extrai número de CDATA array (v5)', () => {
    expect(unwrapOptionalNum([{ '#text': '4' }])).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// attrString
// ---------------------------------------------------------------------------
describe('attrString', () => {
  it('extrai atributo com prefixo @_', () => {
    expect(attrString({ '@_compl': 'PCN 80' }, 'compl')).toBe('PCN 80');
  });

  it('cai no campo sem @_ quando @_ não existe', () => {
    expect(attrString({ compl: 'PCN 80' }, 'compl')).toBe('PCN 80');
  });

  it('retorna undefined para atributo ausente', () => {
    expect(attrString({}, 'compl')).toBeUndefined();
  });

  it('retorna undefined para string vazia', () => {
    expect(attrString({ '@_compl': '' }, 'compl')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// parseTaggedValue
// ---------------------------------------------------------------------------
describe('parseTaggedValue', () => {
  it('retorna {} para null/undefined/string vazia', () => {
    expect(parseTaggedValue(null)).toEqual({});
    expect(parseTaggedValue(undefined)).toEqual({});
    expect(parseTaggedValue('')).toEqual({});
  });

  it('retorna { value } para string simples', () => {
    expect(parseTaggedValue('ASPH')).toEqual({ value: 'ASPH' });
  });

  it('extrai #text e atributo compl do objeto', () => {
    const result = parseTaggedValue({ '#text': 'ASPH', '@_compl': 'PCN 80' });
    expect(result).toEqual({ value: 'ASPH', compl: 'PCN 80' });
  });

  it('omite compl quando ausente', () => {
    expect(parseTaggedValue({ '#text': '3000' })).toEqual({ value: '3000' });
  });

  it('retorna {} para objeto com valor vazio', () => {
    expect(parseTaggedValue({ '#text': '' })).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// stripEmptyTagged
// ---------------------------------------------------------------------------
describe('stripEmptyTagged', () => {
  it('retorna undefined quando value e compl são ambos undefined', () => {
    expect(stripEmptyTagged({})).toBeUndefined();
  });

  it('retorna undefined quando value e compl são strings vazias', () => {
    expect(stripEmptyTagged({ value: '', compl: '' })).toBeUndefined();
  });

  it('preserva objeto com value preenchido', () => {
    expect(stripEmptyTagged({ value: 'ASPH' })).toEqual({ value: 'ASPH' });
  });

  it('preserva objeto com apenas compl preenchido', () => {
    expect(stripEmptyTagged({ compl: 'PCN 80' })).toEqual({ compl: 'PCN 80' });
  });
});

// ---------------------------------------------------------------------------
// parseRmkTextNode
// ---------------------------------------------------------------------------
describe('parseRmkTextNode', () => {
  it('retorna {} para null/não-objeto', () => {
    expect(parseRmkTextNode(null)).toEqual({});
    expect(parseRmkTextNode('texto')).toEqual({});
  });

  it('extrai cod do atributo @_cod', () => {
    const node = { '@_cod': 'PHR', '#text': 'Texto da observação' };
    const result = parseRmkTextNode(node);
    expect(result.cod).toBe('PHR');
    expect(result.text).toBe('Texto da observação');
  });

  it('omite text quando nó não tem conteúdo de texto', () => {
    const result = parseRmkTextNode({ '@_cod': 'X' });
    expect(result.cod).toBe('X');
    expect(result.text).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// collectLightEntriesFromLightsNodes
// ---------------------------------------------------------------------------
describe('collectLightEntriesFromLightsNodes', () => {
  it('retorna array vazio para null', () => {
    expect(collectLightEntriesFromLightsNodes(null)).toEqual([]);
  });

  it('extrai compl e descr dos nós light', () => {
    const lights = {
      light: [
        { '@_compl': 'HIRL', '@_descr': 'High intensity' },
        { '@_compl': 'TDZ', '@_descr': 'Touchdown zone' },
      ],
    };
    const result = collectLightEntriesFromLightsNodes(lights);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ compl: 'HIRL', descr: 'High intensity' });
    expect(result[1]).toEqual({ compl: 'TDZ', descr: 'Touchdown zone' });
  });

  it('ignora entradas sem compl e sem descr', () => {
    const lights = { light: [{ '@_other': 'x' }] };
    expect(collectLightEntriesFromLightsNodes(lights)).toEqual([]);
  });

  it('aceita bloco único de lights (não array)', () => {
    const lights = { light: { '@_compl': 'HIRL' } };
    const result = collectLightEntriesFromLightsNodes(lights);
    expect(result).toHaveLength(1);
    expect(result[0].compl).toBe('HIRL');
  });
});

// ---------------------------------------------------------------------------
// buildRotaerDto — campos principais
// ---------------------------------------------------------------------------
describe('buildRotaerDto', () => {
  it('retorna objeto vazio para parsed sem aisweb', () => {
    expect(buildRotaerDto({})).toEqual({});
  });

  it('extrai meta (status e dt)', () => {
    const parsed = {
      aisweb: { status: 'Active', dt: '2026-01-22' } as Record<string, unknown>,
    };
    const dto = buildRotaerDto(parsed);
    expect(dto.meta).toEqual({ status: 'Active', dt: '2026-01-22' });
  });

  it('extrai identification (icao, ciad, name)', () => {
    const parsed = {
      aisweb: {
        AeroCode: [{ '#text': 'SBGR' }],
        ciad: 'SP0002',
        name: [{ '#text': 'Guarulhos' }],
      } as Record<string, unknown>,
    };
    const dto = buildRotaerDto(parsed);
    expect(dto.identification).toEqual({
      icao: 'SBGR',
      ciad: 'SP0002',
      name: 'Guarulhos',
    });
  });

  it('extrai locality (city, uf)', () => {
    const parsed = {
      aisweb: { city: 'São Paulo', uf: 'SP' } as Record<string, unknown>,
    };
    const dto = buildRotaerDto(parsed);
    expect(dto.locality).toEqual({ city: 'São Paulo', uf: 'SP' });
  });

  it('extrai coordinates', () => {
    const parsed = {
      aisweb: {
        lat: '-23.43',
        lng: '-46.47',
        latRotaer: '23 26 08S',
        lngRotaer: '046 28 23W',
        distance: '24/NE',
      } as Record<string, unknown>,
    };
    const dto = buildRotaerDto(parsed);
    expect(dto.coordinates).toEqual({
      latitude: '-23.43',
      longitude: '-46.47',
      latitudeRotaer: '23 26 08S',
      longitudeRotaer: '046 28 23W',
      distance: '24/NE',
    });
  });

  it('extrai timezone (utcOffset)', () => {
    const parsed = {
      aisweb: { utc: '-3' } as Record<string, unknown>,
    };
    const dto = buildRotaerDto(parsed);
    expect(dto.timezone).toEqual({ utcOffset: '-3' });
  });

  it('extrai elevation (meters, feet)', () => {
    const parsed = {
      aisweb: { altM: '750', altFt: '2461' } as Record<string, unknown>,
    };
    const dto = buildRotaerDto(parsed);
    expect(dto.elevation).toEqual({ meters: '750', feet: '2461' });
  });

  it('extrai airspace (fir, jurisdiction)', () => {
    const parsed = {
      aisweb: { fir: 'SBBS', jur: 'CRCEA-SE' } as Record<string, unknown>,
    };
    const dto = buildRotaerDto(parsed);
    expect(dto.airspace).toEqual({ fir: 'SBBS', jurisdiction: 'CRCEA-SE' });
  });

  it('omite campos cujos valores são string vazia ou null', () => {
    const parsed = {
      aisweb: { city: '', uf: null } as Record<string, unknown>,
    };
    const dto = buildRotaerDto(parsed);
    expect(dto.locality).toBeUndefined();
  });

  it('extrai operator de aisweb.org', () => {
    const parsed = {
      aisweb: {
        org: { name: 'INFRAERO', type: 'ORG', military: 'CIVIL' },
      } as Record<string, unknown>,
    };
    const dto = buildRotaerDto(parsed);
    expect(dto.operator).toEqual({
      name: 'INFRAERO',
      type: 'ORG',
      military: 'CIVIL',
    });
  });

  it('extrai runways com count e itens', () => {
    const parsed = {
      aisweb: {
        runways: {
          '@_count': '1',
          runway: {
            '@_compl': '09R/27L',
            type: 'ASPH',
            ident: '09R',
            thr: { '@_compl': '09R', ident: '09R' },
          },
        },
      } as Record<string, unknown>,
    };
    const dto = buildRotaerDto(parsed);
    const runways = dto.runways as { count: number; items: unknown[] };
    expect(runways.count).toBe(1);
    expect(runways.items).toHaveLength(1);
  });

  it('extrai remarks com cod e text de rmkText', () => {
    const parsed = {
      aisweb: {
        rmk: {
          '@_count': '1',
          rmkText: [{ '@_cod': 'PHR', '#text': 'Pista em reforma' }],
        },
      } as Record<string, unknown>,
    };
    const dto = buildRotaerDto(parsed);
    const remarks = dto.remarks as {
      count: number;
      items: { cod?: string; text?: string }[];
    };
    expect(remarks.count).toBe(1);
    expect(remarks.items[0]).toMatchObject({
      cod: 'PHR',
      text: 'Pista em reforma',
    });
  });
});
