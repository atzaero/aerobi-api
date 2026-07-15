import { RabCsvParserService } from './rab-csv-parser.service';

const HEADER = '"MARCAS";"PROPRIETARIOS";"OPERADORES";"DS_MODELO"';

function csvBuffer(body: string, encoding: BufferEncoding = 'utf-8'): Buffer {
  const csv = ['"Atualizado em: 01/03/2026"', HEADER, body].join('\n');
  return Buffer.from(csv, encoding);
}

describe('RabCsvParserService', () => {
  let service: RabCsvParserService;

  beforeEach(() => {
    service = new RabCsvParserService();
  });

  it('parseia linhas válidas, aplica o period e mapeia colunas', () => {
    const rows = service.parseBuffer(
      csvBuffer('"PPABC";"José Antônio";"Empresa X";"C172"'),
      '2026-03',
    );

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      period: '2026-03',
      marcas: 'PPABC',
      proprietarios: 'José Antônio',
      operadores: 'Empresa X',
      dsModelo: 'C172',
    });
  });

  it('converte campos vazios em null (mantendo a linha com marcas)', () => {
    const rows = service.parseBuffer(csvBuffer('"PTXYZ";"";"";""'), '2026-03');

    expect(rows).toHaveLength(1);
    expect(rows[0].marcas).toBe('PTXYZ');
    expect(rows[0].proprietarios).toBeNull();
    expect(rows[0].operadores).toBeNull();
    expect(rows[0].dsModelo).toBeNull();
  });

  it('descarta linhas sem marcas', () => {
    const body = ['"PPABC";"Fulano";"";""', '"";"orfa";"";""'].join('\n');

    const rows = service.parseBuffer(csvBuffer(body), '2026-03');

    expect(rows).toHaveLength(1);
    expect(rows[0].marcas).toBe('PPABC');
  });

  it('decodifica windows-1252 quando o buffer não é UTF-8 válido', () => {
    const rows = service.parseBuffer(
      csvBuffer('"PPABC";"José";"";""', 'latin1'),
      '2026-03',
    );

    expect(rows[0].proprietarios).toBe('José');
  });

  it('lança quando o header MARCAS não é encontrado', () => {
    const buffer = Buffer.from('coluna_a;coluna_b\n1;2', 'utf-8');

    expect(() => service.parseBuffer(buffer, '2026-03')).toThrow(
      /header MARCAS não encontrado/,
    );
  });
});
