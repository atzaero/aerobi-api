import { generateSecurityCode } from './security-code.util';

describe('generateSecurityCode', () => {
  it('gera 8 caracteres do alfabeto sem ambíguos', () => {
    const code = generateSecurityCode();
    expect(code).toHaveLength(8);
    expect(code).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/);
  });

  it('gera códigos distintos em sequência', () => {
    const codes = new Set(
      Array.from({ length: 20 }, () => generateSecurityCode()),
    );
    expect(codes.size).toBeGreaterThan(1);
  });
});
