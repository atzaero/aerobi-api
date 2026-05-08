import { calculateValidity } from './validity-calculator.util';

describe('calculateValidity', () => {
  it('retorna inválido para validade null', () => {
    const result = calculateValidity(null);
    expect(result).toEqual({
      valida: false,
      emTolerancia: false,
      diasParaVencimento: null,
    });
  });

  it('retorna inválido para data inválida', () => {
    const result = calculateValidity('invalid');
    expect(result).toEqual({
      valida: false,
      emTolerancia: false,
      diasParaVencimento: null,
    });
  });

  it('retorna válido para data futura', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const dateStr = `${futureDate.getDate()}/${futureDate.getMonth() + 1}/${futureDate.getFullYear()}`;

    const result = calculateValidity(dateStr);
    expect(result.valida).toBe(true);
    expect(result.emTolerancia).toBe(false);
    expect(result.diasParaVencimento).toBeGreaterThan(0);
  });

  it('retorna válido para data de hoje', () => {
    const today = new Date();
    const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

    const result = calculateValidity(dateStr);
    expect(result.valida).toBe(true);
    expect(result.emTolerancia).toBe(false);
    expect(result.diasParaVencimento).toBe(0);
  });

  it('retorna válido em período de tolerância (venceu há menos de 30 dias)', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 15);
    const dateStr = `${pastDate.getDate()}/${pastDate.getMonth() + 1}/${pastDate.getFullYear()}`;

    const result = calculateValidity(dateStr);
    expect(result.valida).toBe(true);
    expect(result.emTolerancia).toBe(true);
    expect(result.diasParaVencimento).toBeLessThan(0);
    expect(result.diasParaVencimento).toBeGreaterThanOrEqual(-30);
  });

  it('retorna inválido para data vencida há mais de 30 dias', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 45);
    const dateStr = `${pastDate.getDate()}/${pastDate.getMonth() + 1}/${pastDate.getFullYear()}`;

    const result = calculateValidity(dateStr);
    expect(result.valida).toBe(false);
    expect(result.emTolerancia).toBe(false);
    expect(result.diasParaVencimento).toBeLessThan(-30);
  });

  it('calcula corretamente dias para vencimento positivo', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const dateStr = `${futureDate.getDate()}/${futureDate.getMonth() + 1}/${futureDate.getFullYear()}`;

    const result = calculateValidity(dateStr);
    expect(result.diasParaVencimento).toBe(10);
  });

  it('limite exato de 30 dias em tolerância é válido', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 30);
    const dateStr = `${pastDate.getDate()}/${pastDate.getMonth() + 1}/${pastDate.getFullYear()}`;

    const result = calculateValidity(dateStr);
    expect(result.valida).toBe(true);
    expect(result.emTolerancia).toBe(true);
    expect(result.diasParaVencimento).toBeGreaterThanOrEqual(-30);
  });
});
