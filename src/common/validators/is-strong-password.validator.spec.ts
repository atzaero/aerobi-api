import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { IsStrongPassword } from './is-strong-password.validator';

class Sample {
  @IsStrongPassword()
  password!: string;
}

function violations(password: string): string[] {
  const dto = plainToInstance(Sample, { password });
  const errors = validateSync(dto);
  if (errors.length === 0) return [];
  return Object.values(errors[0].constraints ?? {});
}

describe('IsStrongPassword', () => {
  it('aceita senha válida (≥8 chars, letras + números)', () => {
    expect(violations('Senha123')).toEqual([]);
  });

  it('rejeita senha com menos de 8 chars', () => {
    const errs = violations('Abc12');
    expect(errs.join(' ')).toMatch(/8 caracteres/);
  });

  it('rejeita senha apenas com números', () => {
    expect(violations('12345678').length).toBeGreaterThan(0);
  });

  it('rejeita senha apenas com letras', () => {
    expect(violations('AbcDefGhi').length).toBeGreaterThan(0);
  });

  it('rejeita senha vazia', () => {
    expect(violations('').length).toBeGreaterThan(0);
  });
});
