import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { AerodromeIcaoParamDTO } from './aerodrome-icao-param.dto';

/** `true` quando `icao` não tem nenhum erro de validação. */
function isValid(icao: unknown): boolean {
  const errors = validateSync(plainToInstance(AerodromeIcaoParamDTO, { icao }));
  return errors.length === 0;
}

describe('AerodromeIcaoParamDTO', () => {
  it.each(['SBSP', 'SJ4E', 'SI63', 'sbsp'])(
    'aceita ICAO alfanumérico de 4 caracteres %s (minúsculas incluídas)',
    (icao) => {
      expect(isValid(icao)).toBe(true);
    },
  );

  it.each(['SBS', 'SBSPX', 'SB S', 'SB-P', ''])(
    'rejeita ICAO inválido %s',
    (bad) => {
      expect(isValid(bad)).toBe(false);
    },
  );
});
