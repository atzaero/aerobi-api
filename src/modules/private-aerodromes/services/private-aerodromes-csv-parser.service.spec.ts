import { PrivateAerodromesCsvParserService } from './private-aerodromes-csv-parser.service';

function makeBuffer(text: string): Buffer {
  return Buffer.from(text, 'utf-8');
}

const VALID_CSV_HEADER = 'Atualizado em: 2024-01-15';
const VALID_CSV_COLUMNS =
  'CIAD;Código OACI;Nome;Município;UF;Longitude;Latitude;Altitude;Operação Diurna;Operação Noturna;Designação 1;Comprimento 1;Largura 1;Resistência 1;Superfície 1;Designação 2;Comprimento 2;Largura 2;Resistência 2;Superfície 2;Portaria de Registro;Link Portaria;LatGeoPoint;LonGeoPoint';

function makeValidCsv(dataRows: string[]): Buffer {
  const lines = [VALID_CSV_HEADER, VALID_CSV_COLUMNS, ...dataRows].join('\n');
  return makeBuffer(lines);
}

describe('PrivateAerodromesCsvParserService', () => {
  let service: PrivateAerodromesCsvParserService;

  beforeEach(() => {
    service = new PrivateAerodromesCsvParserService();
  });

  describe('parseBuffer', () => {
    it('parseia CSV válido e retorna rows corretamente mapeadas', () => {
      const buffer = makeValidCsv([
        'SJXX;OACI1;Aeródromo Alpha;São Paulo;SP;-46.0;-23.0;750;;;Pista 1;1000;30;;;;;;;;;;;',
      ]);

      const rows = service.parseBuffer(buffer);

      expect(rows).toHaveLength(1);
      expect(rows[0].ciad).toBe('SJXX');
      expect(rows[0].codigoOaci).toBe('OACI1');
      expect(rows[0].nome).toBe('Aeródromo Alpha');
      expect(rows[0].municipio).toBe('São Paulo');
      expect(rows[0].uf).toBe('SP');
    });

    it('parseia múltiplas rows', () => {
      const buffer = makeValidCsv([
        'SJXX;;Aeródromo A;Campinas;SP;;;;;;;;;;;;;;;;;;;;;',
        'SJYY;;Aeródromo B;Curitiba;PR;;;;;;;;;;;;;;;;;;;;;',
      ]);

      const rows = service.parseBuffer(buffer);

      expect(rows).toHaveLength(2);
      expect(rows[0].ciad).toBe('SJXX');
      expect(rows[1].ciad).toBe('SJYY');
    });

    it('pula linhas sem campo CIAD', () => {
      const buffer = makeValidCsv([
        ';;Sem CIAD;São Paulo;SP;;;;;;;;;;;;;;;;;;;;;',
        'SJXX;;Com CIAD;Campinas;SP;;;;;;;;;;;;;;;;;;;;;',
      ]);

      const rows = service.parseBuffer(buffer);

      expect(rows).toHaveLength(1);
      expect(rows[0].ciad).toBe('SJXX');
    });

    it('retorna array vazio quando todos os registros não têm CIAD', () => {
      const buffer = makeValidCsv([
        ';;Sem CIAD 1;SP;SP;;;;;;;;;;;;;;;;;;;;;',
        ';;Sem CIAD 2;RJ;RJ;;;;;;;;;;;;;;;;;;;;;',
      ]);

      const rows = service.parseBuffer(buffer);

      expect(rows).toHaveLength(0);
    });

    it('retorna array vazio quando não há linhas de dados', () => {
      const buffer = makeValidCsv([]);

      const rows = service.parseBuffer(buffer);

      expect(rows).toHaveLength(0);
    });

    it('lança erro quando buffer não contém \\n (sem header de colunas)', () => {
      const buffer = makeBuffer('sem quebra de linha nenhuma');

      expect(() => service.parseBuffer(buffer)).toThrow(
        'CSV de aerodromos privados inválido: sem header',
      );
    });

    it('mapeia campos opcionais como null quando vazios', () => {
      const buffer = makeValidCsv(['SJZZ;;;;;;;;;;;;;;;;;;;;;;']);

      const rows = service.parseBuffer(buffer);

      expect(rows[0].codigoOaci).toBeNull();
      expect(rows[0].nome).toBeNull();
      expect(rows[0].municipio).toBeNull();
      expect(rows[0].uf).toBeNull();
    });

    it('aceita contentType como opção sem alterar o resultado para UTF-8 válido', () => {
      const buffer = makeValidCsv(['SJXX;;Teste;SP;SP;;;;;;;;;;;;;;;;;;;;;']);

      const rows = service.parseBuffer(buffer, {
        contentType: 'text/csv; charset=utf-8',
      });

      expect(rows).toHaveLength(1);
      expect(rows[0].ciad).toBe('SJXX');
    });
  });
});
