import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { CreateAerodromeDTO } from '../dtos/create-aerodrome.dto';
import { UpdateAerodromeDTO } from '../dtos/update-aerodrome.dto';

import {
  AERODROME_EXAMPLE_FULL,
  AERODROME_EXAMPLE_MIN_CONSTRUCTION,
  AERODROME_EXAMPLE_MIN_OPERATIONAL,
  AERODROME_UPDATE_EXAMPLE_FULL,
  AERODROME_UPDATE_EXAMPLE_MIN_OPERATIONAL,
} from './aerodrome-request.examples';

/**
 * Trava a invariante do feedback do dono: os exemplos exibidos no Swagger têm de
 * PASSAR na validação real do DTO (com os mesmos transforms + `whitelist` do
 * `ValidationPipe` global). Se alguém editar um exemplo para um valor inválido
 * (ex.: `altitude: 'string'`), este teste falha em vez de o dev descobrir com um
 * 400 ao copiar o exemplo.
 */
function validationErrors(
  cls: typeof CreateAerodromeDTO | typeof UpdateAerodromeDTO,
  payload: Record<string, unknown>,
): string[] {
  const dto = plainToInstance(cls, payload);
  return validateSync(dto, { whitelist: true }).flatMap((e) =>
    Object.values(e.constraints ?? {}),
  );
}

describe('exemplos de payload do Swagger (aeródromo) são válidos', () => {
  it.each([
    ['completo', AERODROME_EXAMPLE_FULL],
    ['mínimo operacional', AERODROME_EXAMPLE_MIN_OPERATIONAL],
    ['mínimo em construção', AERODROME_EXAMPLE_MIN_CONSTRUCTION],
  ])('create — %s passa na validação', (_label, payload) => {
    expect(validationErrors(CreateAerodromeDTO, payload)).toEqual([]);
  });

  it.each([
    ['completo', AERODROME_UPDATE_EXAMPLE_FULL],
    ['mínimo operacional', AERODROME_UPDATE_EXAMPLE_MIN_OPERATIONAL],
  ])('update — %s passa na validação', (_label, payload) => {
    expect(validationErrors(UpdateAerodromeDTO, payload)).toEqual([]);
  });
});
