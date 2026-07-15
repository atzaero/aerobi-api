import { resolveRabCsvTextDecoderLabel } from './rab-csv-encoding';

describe('resolveRabCsvTextDecoderLabel', () => {
  const utf8Buffer = Buffer.from('MARCAS;PROPRIETARIOS', 'utf-8');

  describe('charset a partir do Content-Type', () => {
    it('normaliza `utf8` para `utf-8`', () => {
      expect(
        resolveRabCsvTextDecoderLabel(utf8Buffer, 'text/csv; charset=utf8'),
      ).toBe('utf-8');
    });

    it('normaliza `latin1` para `iso-8859-1`', () => {
      expect(
        resolveRabCsvTextDecoderLabel(utf8Buffer, 'text/csv; charset=latin1'),
      ).toBe('iso-8859-1');
    });

    it('normaliza `cp1252` para `windows-1252`', () => {
      expect(
        resolveRabCsvTextDecoderLabel(utf8Buffer, 'text/csv; charset=cp1252'),
      ).toBe('windows-1252');
    });

    it('remove aspas em volta do charset', () => {
      expect(
        resolveRabCsvTextDecoderLabel(
          utf8Buffer,
          'text/csv; charset="ISO-8859-1"',
        ),
      ).toBe('iso-8859-1');
    });

    it('ignora charset não suportado e cai na heurística (buffer UTF-8 → utf-8)', () => {
      expect(
        resolveRabCsvTextDecoderLabel(
          utf8Buffer,
          'text/csv; charset=foobar-999',
        ),
      ).toBe('utf-8');
    });
  });

  describe('heurística sobre o buffer (sem Content-Type)', () => {
    it('detecta BOM UTF-8 e retorna `utf-8`', () => {
      const withBom = Buffer.concat([
        Buffer.from([0xef, 0xbb, 0xbf]),
        Buffer.from('MARCAS', 'latin1'),
      ]);
      expect(resolveRabCsvTextDecoderLabel(withBom)).toBe('utf-8');
    });

    it('retorna `utf-8` para buffer UTF-8 válido', () => {
      expect(
        resolveRabCsvTextDecoderLabel(Buffer.from('aeronave ç ã é', 'utf-8')),
      ).toBe('utf-8');
    });

    it('faz fallback para `windows-1252` quando o buffer não é UTF-8 válido', () => {
      // 0xE9 isolado ("é" em latin1) não é uma sequência UTF-8 válida.
      const latinBuffer = Buffer.from([0x41, 0xe9, 0x42]);
      expect(resolveRabCsvTextDecoderLabel(latinBuffer)).toBe('windows-1252');
    });
  });
});
