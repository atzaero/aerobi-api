import {
  normalizeEmailValue,
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
