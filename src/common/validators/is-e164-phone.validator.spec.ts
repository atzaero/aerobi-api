import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { IsOptional, MaxLength } from 'class-validator';

import { NormalizeOptionalPhone } from '../transform';
import { IsE164Phone } from './is-e164-phone.validator';

class Sample {
  @IsOptional()
  @NormalizeOptionalPhone()
  @IsE164Phone()
  @MaxLength(32)
  phone?: string | null;
}

function validate(phone: unknown): {
  value: unknown;
  errors: string[];
} {
  const dto = plainToInstance(Sample, { phone });
  const errors = validateSync(dto);
  return {
    value: dto.phone,
    errors: errors.flatMap((e) => Object.values(e.constraints ?? {})),
  };
}

describe('IsE164Phone (+ NormalizeOptionalPhone)', () => {
  it('aceita e normaliza um número com máscara BR', () => {
    const { value, errors } = validate('+55 11 99999-9999');
    expect(errors).toEqual([]);
    expect(value).toBe('+5511999999999');
  });

  it('aceita um número já em E.164', () => {
    const { value, errors } = validate('+5511999999999');
    expect(errors).toEqual([]);
    expect(value).toBe('+5511999999999');
  });

  it('aceita ausência do campo (undefined → opcional)', () => {
    expect(validate(undefined).errors).toEqual([]);
  });

  it('aceita string vazia, normalizando para null', () => {
    const { value, errors } = validate('');
    expect(errors).toEqual([]);
    expect(value).toBe(null);
  });

  it('rejeita texto sem dígitos com a mensagem E.164', () => {
    const { errors } = validate('abc');
    expect(errors.join(' ')).toMatch(/código do país e DDD/);
  });

  it('rejeita número curto demais para E.164', () => {
    expect(validate('+551').errors.length).toBeGreaterThan(0);
  });
});
