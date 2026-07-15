import { type CsvColumn, EXPORT_MAX_ROWS, toCsv } from './csv.util';

interface Row {
  a: string;
  n: number | null;
}

const BOM = '\uFEFF';
const cols: CsvColumn<Row>[] = [
  { header: 'A', accessor: (r) => r.a },
  { header: 'N', accessor: (r) => r.n },
];

describe('csv.util', () => {
  it('EXPORT_MAX_ROWS = 50000', () => {
    expect(EXPORT_MAX_ROWS).toBe(50_000);
  });

  it('inicia com BOM UTF-8', () => {
    expect(toCsv([], cols).charCodeAt(0)).toBe(0xfeff);
  });

  it('cabeçalho sempre presente, mesmo sem linhas', () => {
    expect(toCsv([], cols)).toBe(`${BOM}A,N`);
  });

  it('usa CRLF entre as linhas', () => {
    expect(toCsv([{ a: 'x', n: 1 }], cols)).toBe(`${BOM}A,N\r\nx,1`);
  });

  it('null vira vazio; número vira decimal', () => {
    expect(toCsv([{ a: '', n: null }], cols)).toBe(`${BOM}A,N\r\n,`);
  });

  it('escapa RFC 4180: vírgula, aspas e quebra de linha', () => {
    const c: CsvColumn<{ v: string }>[] = [
      { header: 'V', accessor: (r) => r.v },
    ];
    expect(toCsv([{ v: 'a,b' }], c)).toBe(`${BOM}V\r\n"a,b"`);
    expect(toCsv([{ v: 'a"b' }], c)).toBe(`${BOM}V\r\n"a""b"`);
    expect(toCsv([{ v: 'a\nb' }], c)).toBe(`${BOM}V\r\n"a\nb"`);
  });

  describe('neutraliza CSV/formula injection', () => {
    const c: CsvColumn<{ v: string }>[] = [
      { header: 'V', accessor: (r) => r.v },
    ];

    it('prefixa com apóstrofo strings iniciando com = + - @', () => {
      expect(toCsv([{ v: '=HYPERLINK("http://evil","x")' }], c)).toBe(
        `${BOM}V\r\n"'=HYPERLINK(""http://evil"",""x"")"`,
      );
      expect(toCsv([{ v: '+1' }], c)).toBe(`${BOM}V\r\n'+1`);
      expect(toCsv([{ v: '-1+2' }], c)).toBe(`${BOM}V\r\n'-1+2`);
      expect(toCsv([{ v: '@cmd' }], c)).toBe(`${BOM}V\r\n'@cmd`);
    });

    it('prefixa strings iniciando com tab ou CR', () => {
      expect(toCsv([{ v: '\t=1' }], c)).toBe(`${BOM}V\r\n'\t=1`);
      expect(toCsv([{ v: '\rfoo' }], c)).toBe(`${BOM}V\r\n"'\rfoo"`);
    });

    it('combina neutralização com escape RFC 4180 (vírgula)', () => {
      expect(toCsv([{ v: '=cmd(),x' }], c)).toBe(`${BOM}V\r\n"'=cmd(),x"`);
    });

    it('não prefixa números negativos (vêm de String(number), seguros)', () => {
      const nc: CsvColumn<{ n: number }>[] = [
        { header: 'N', accessor: (r) => r.n },
      ];
      expect(toCsv([{ n: -5 }], nc)).toBe(`${BOM}N\r\n-5`);
    });

    it('não prefixa strings sem gatilho de fórmula', () => {
      expect(toCsv([{ v: 'foo=bar' }], c)).toBe(`${BOM}V\r\nfoo=bar`);
    });
  });
});
