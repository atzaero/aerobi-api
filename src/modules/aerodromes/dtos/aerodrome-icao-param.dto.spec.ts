import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { AerodromeIcaoParamDTO } from './aerodrome-icao-param.dto';

const toDto = (icao: unknown) =>
  plainToInstance(AerodromeIcaoParamDTO, { icao });

const errorsFor = (icao: unknown) => validateSync(toDto(icao));

describe('AerodromeIcaoParamDTO', () => {
  it('aceita ICAO alfanumérico de 4 chars e normaliza para uppercase', () => {
    expect(errorsFor('SJ4E')).toEqual([]);
    expect(errorsFor('sbsp')).toEqual([]);
    expect(toDto('sbsp').icao).toBe('SBSP');
    expect(toDto('  sj4e  ').icao).toBe('SJ4E');
  });

  it('rejeita comprimento ou caracteres inválidos', () => {
    expect(errorsFor('SB')).not.toEqual([]);
    expect(errorsFor('SBSPX')).not.toEqual([]);
    expect(errorsFor('SB-P')).not.toEqual([]);
  });
});
