import { sanitizePhone, toWhatsappJid, toWhatsappNumber } from './phone.util';

describe('phone.util', () => {
  describe('sanitizePhone', () => {
    it('remove tudo que não é dígito', () => {
      expect(sanitizePhone('+55 (11) 99999-0001')).toBe('5511999990001');
    });
  });

  describe('toWhatsappNumber', () => {
    it('mantém número que já vem com DDI', () => {
      expect(toWhatsappNumber('+55 11 99999-0001')).toBe('5511999990001');
    });

    it('prefixa DDI 55 em número nacional de 11 dígitos (celular)', () => {
      expect(toWhatsappNumber('(11) 99999-0001')).toBe('5511999990001');
    });

    it('prefixa DDI 55 em número nacional de 10 dígitos (fixo)', () => {
      expect(toWhatsappNumber('11 3333-0001')).toBe('551133330001');
    });

    it('respeita country code customizado em número nacional', () => {
      expect(toWhatsappNumber('11999990001', '54')).toBe('5411999990001');
    });

    it('devolve null para vazio/ausente', () => {
      expect(toWhatsappNumber('')).toBeNull();
      expect(toWhatsappNumber(null)).toBeNull();
      expect(toWhatsappNumber(undefined)).toBeNull();
    });

    it('devolve null quando fica curto demais (ruído)', () => {
      expect(toWhatsappNumber('999')).toBeNull();
    });
  });

  describe('toWhatsappJid', () => {
    it('anexa o sufixo de contato individual', () => {
      expect(toWhatsappJid('5511999990001')).toBe(
        '5511999990001@s.whatsapp.net',
      );
    });
  });
});
