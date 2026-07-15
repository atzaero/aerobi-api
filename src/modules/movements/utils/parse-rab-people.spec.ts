import { parseOperadores, parseProprietarios } from './parse-rab-people';

describe('parse-rab-people', () => {
  describe('parseProprietarios', () => {
    it('parses a valid JSON array with multiple items, projecting contract keys', () => {
      const raw = JSON.stringify([
        {
          NOME: 'FULANO',
          DOCUMENTO: '231XXXXXX68',
          PERCENTUAL: '60.00',
          UF: 'PR',
        },
        {
          NOME: 'CICRANO',
          DOCUMENTO: '999XXXXXX11',
          PERCENTUAL: '40.00',
          UF: 'SP',
        },
      ]);

      expect(parseProprietarios(raw)).toEqual([
        {
          NOME: 'FULANO',
          DOCUMENTO: '231XXXXXX68',
          PERCENTUAL: '60.00',
          UF: 'PR',
        },
        {
          NOME: 'CICRANO',
          DOCUMENTO: '999XXXXXX11',
          PERCENTUAL: '40.00',
          UF: 'SP',
        },
      ]);
    });

    it('preserves masked documents exactly as received', () => {
      const raw = JSON.stringify([{ NOME: 'X', DOCUMENTO: '231XXXXXX68' }]);
      expect(parseProprietarios(raw)[0].DOCUMENTO).toBe('231XXXXXX68');
    });

    it('fills missing contract keys with null and drops extra keys', () => {
      const raw = JSON.stringify([{ NOME: 'FULANO', EXTRA: 'ignored' }]);
      expect(parseProprietarios(raw)).toEqual([
        { NOME: 'FULANO', DOCUMENTO: null, PERCENTUAL: null, UF: null },
      ]);
    });

    it('coerces numeric/boolean field values to string', () => {
      const raw = '[{"NOME":"X","PERCENTUAL":100}]';
      expect(parseProprietarios(raw)[0].PERCENTUAL).toBe('100');
    });
  });

  describe('parseOperadores', () => {
    it('projects the full operador contract shape', () => {
      const raw = JSON.stringify([
        {
          NOME: 'EMPRESA',
          DOCUMENTO: '00000000000191',
          OPERACAO135: 'S',
          TRANSPREGULAR135: 'N',
          AUTORIZACAOPMAC135: 'N',
          OPERACAO121: 'N',
          TRANSPREGULAR121: 'N',
          AUTORIZACAOPMAC121: 'N',
          SAE: 'N',
          AUTHISTRUT: 'N',
          UF: 'PR',
        },
      ]);

      expect(parseOperadores(raw)).toEqual([
        {
          NOME: 'EMPRESA',
          DOCUMENTO: '00000000000191',
          OPERACAO135: 'S',
          TRANSPREGULAR135: 'N',
          AUTORIZACAOPMAC135: 'N',
          OPERACAO121: 'N',
          TRANSPREGULAR121: 'N',
          AUTORIZACAOPMAC121: 'N',
          SAE: 'N',
          AUTHISTRUT: 'N',
          UF: 'PR',
        },
      ]);
    });

    it('wraps a single JSON object into a one-item array', () => {
      const raw = JSON.stringify({ NOME: 'SOLO', UF: 'RS' });
      const result = parseOperadores(raw);
      expect(result).toHaveLength(1);
      expect(result[0].NOME).toBe('SOLO');
      expect(result[0].UF).toBe('RS');
    });
  });

  describe.each([
    ['parseOperadores', parseOperadores],
    ['parseProprietarios', parseProprietarios],
  ])('%s — edge cases', (_label, parse) => {
    it('returns [] for null', () => {
      expect(parse(null)).toEqual([]);
    });

    it('returns [] for undefined', () => {
      expect(parse(undefined)).toEqual([]);
    });

    it('returns [] for empty / whitespace-only text', () => {
      expect(parse('')).toEqual([]);
      expect(parse('   ')).toEqual([]);
    });

    it('returns [] for an empty JSON array', () => {
      expect(parse('[]')).toEqual([]);
    });

    it('returns [] for malformed JSON', () => {
      expect(parse('[{NOME:')).toEqual([]);
      expect(parse('not json at all')).toEqual([]);
    });

    it('returns [] for JSON that is not an object/array (e.g. a number)', () => {
      expect(parse('42')).toEqual([]);
    });

    it('ignores non-object entries inside a JSON array', () => {
      expect(parse('[null, 1, "x"]')).toEqual([]);
    });
  });

  describe('legacy pipe-delimited tolerance', () => {
    it('parses a single KEY=VALUE pipe record (proprietarios)', () => {
      expect(parseProprietarios('NOME=FULANO|DOCUMENTO=123|UF=PR')).toEqual([
        { NOME: 'FULANO', DOCUMENTO: '123', PERCENTUAL: null, UF: 'PR' },
      ]);
    });

    it('parses a single KEY=VALUE pipe record (operadores)', () => {
      expect(parseOperadores('NOME=EMPRESA|OPERACAO135=S|UF=RS')).toEqual([
        {
          NOME: 'EMPRESA',
          DOCUMENTO: null,
          OPERACAO135: 'S',
          TRANSPREGULAR135: null,
          AUTORIZACAOPMAC135: null,
          OPERACAO121: null,
          TRANSPREGULAR121: null,
          AUTORIZACAOPMAC121: null,
          SAE: null,
          AUTHISTRUT: null,
          UF: 'RS',
        },
      ]);
    });

    it('returns [] when no recognizable pairs exist', () => {
      expect(parseProprietarios('just some free text without pairs')).toEqual(
        [],
      );
    });

    it('does not treat a `:`-only pipe segment (e.g. a URL) as a pair', () => {
      expect(parseProprietarios('https://example.com|NOME=X')).toEqual([
        { NOME: 'X', DOCUMENTO: null, PERCENTUAL: null, UF: null },
      ]);
    });
  });
});
