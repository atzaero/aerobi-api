import {
  normalizeEmailValue,
  normalizeOptionalPhoneE164Value,
  optionalQueryBooleanValue,
  trimOptionalStringValue,
  trimStringValue,
} from './value-transforms';

describe('value-transforms', () => {
  describe('trimStringValue', () => {
    it('trima strings', () => {
      expect(trimStringValue('  x  ')).toBe('x');
    });

    it('passa adiante não-strings', () => {
      expect(trimStringValue(1)).toBe(1);
      expect(trimStringValue(undefined)).toBe(undefined);
    });
  });

  describe('trimOptionalStringValue', () => {
    it('preserva undefined e null', () => {
      expect(trimOptionalStringValue(undefined)).toBe(undefined);
      expect(trimOptionalStringValue(null)).toBe(null);
    });

    it('trima strings', () => {
      expect(trimOptionalStringValue('  y ')).toBe('y');
    });

    it('passa adiante primitivos não-string quando definidos', () => {
      expect(trimOptionalStringValue(2)).toBe(2);
    });
  });

  describe('normalizeEmailValue', () => {
    it('trima e lowercaseia emails', () => {
      expect(normalizeEmailValue('  Ana@EXAMPLE.com  ')).toBe(
        'ana@example.com',
      );
    });

    it('passa adiante não-strings', () => {
      expect(normalizeEmailValue(null)).toBe(null);
    });
  });

  describe('normalizeOptionalPhoneE164Value', () => {
    it('preserva undefined e null (semântica PATCH)', () => {
      expect(normalizeOptionalPhoneE164Value(undefined)).toBe(undefined);
      expect(normalizeOptionalPhoneE164Value(null)).toBe(null);
    });

    it('converte string vazia (ou só espaços) para null', () => {
      expect(normalizeOptionalPhoneE164Value('')).toBe(null);
      expect(normalizeOptionalPhoneE164Value('   ')).toBe(null);
    });

    it('descarta a máscara e prefixa + aos dígitos', () => {
      expect(normalizeOptionalPhoneE164Value('+55 11 99999-9999')).toBe(
        '+5511999999999',
      );
      expect(normalizeOptionalPhoneE164Value('(11) 99999-9999')).toBe(
        '+11999999999',
      );
    });

    it('devolve o valor trimado quando não há dígito (deixa o validador rejeitar)', () => {
      expect(normalizeOptionalPhoneE164Value('  abc ')).toBe('abc');
    });

    it('passa adiante não-strings definidos', () => {
      expect(normalizeOptionalPhoneE164Value(123)).toBe(123);
    });
  });

  describe('optionalQueryBooleanValue', () => {
    it('retorna undefined para ausente ou vazio', () => {
      expect(optionalQueryBooleanValue(undefined)).toBe(undefined);
      expect(optionalQueryBooleanValue(null)).toBe(undefined);
      expect(optionalQueryBooleanValue('')).toBe(undefined);
    });

    it('mapeia true e string "true"', () => {
      expect(optionalQueryBooleanValue(true)).toBe(true);
      expect(optionalQueryBooleanValue('true')).toBe(true);
    });

    it('mapeia qualquer outra coisa para false quando presente', () => {
      expect(optionalQueryBooleanValue(false)).toBe(false);
      expect(optionalQueryBooleanValue('false')).toBe(false);
      expect(optionalQueryBooleanValue('no')).toBe(false);
    });
  });
});
