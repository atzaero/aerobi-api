import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { UpdateAerodromeDTO } from './update-aerodrome.dto';

/**
 * Trava a semântica PATCH parcial do update: `PartialType` torna todos os campos
 * opcionais, então editar um único campo NÃO deve disparar a obrigatoriedade
 * condicional de pista (herdada do create) — só o que é enviado é validado.
 */
function errors(payload: Record<string, unknown>): string[] {
  const dto = plainToInstance(UpdateAerodromeDTO, payload);
  return validateSync(dto, { whitelist: true }).flatMap((e) =>
    Object.values(e.constraints ?? {}),
  );
}

describe('UpdateAerodromeDTO — semântica PATCH parcial', () => {
  it('aceita patch de um único campo sem exigir a pista', () => {
    expect(errors({ name: 'Novo nome' })).toEqual([]);
  });

  it('aceita alternar apenas isView', () => {
    expect(errors({ isView: true })).toEqual([]);
  });

  it('aceita patch vazio (nenhuma mudança)', () => {
    expect(errors({})).toEqual([]);
  });

  it('valida o formato do campo enviado (ICAO fora do padrão é rejeitado)', () => {
    expect(errors({ icao: 'toolong' }).length).toBeGreaterThan(0);
  });

  it('valida dígitos de um campo de pista enviado (length inválido é rejeitado)', () => {
    expect(errors({ length: 'abc' }).length).toBeGreaterThan(0);
  });
});
