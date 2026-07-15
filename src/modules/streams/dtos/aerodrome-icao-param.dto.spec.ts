import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { AerodromeIcaoParamDTO } from './aerodrome-icao-param.dto';

/** `true` quando a propriedade indicada não tem nenhum erro de validação. */
function isPropValid(
  payload: Record<string, unknown>,
  prop: keyof AerodromeIcaoParamDTO,
): boolean {
  const errors = validateSync(plainToInstance(AerodromeIcaoParamDTO, payload));
  return !errors.some((e) => e.property === prop);
}

describe('AerodromeIcaoParamDTO', () => {
  describe('icao', () => {
    it.each(['SBSP', 'sbsp', 'SJ4E', 'SI63', 'SD9C', 'sj4e', '0000'])(
      'aceita código alfanumérico de 4 caracteres %s',
      (icao) => {
        expect(isPropValid({ icao }, 'icao')).toBe(true);
      },
    );

    it.each(['SBS', 'SBSPX', 'SB-P', 'SB SP', 'SB.P', ''])(
      'rejeita código inválido %s',
      (icao) => {
        expect(isPropValid({ icao }, 'icao')).toBe(false);
      },
    );
  });
});
