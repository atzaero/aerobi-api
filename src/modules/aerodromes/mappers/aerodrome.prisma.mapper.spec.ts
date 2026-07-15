import type { CreateAerodromeDTO } from '../dtos/create-aerodrome.dto';
import type { UpdateAerodromeDTO } from '../dtos/update-aerodrome.dto';

import {
  buildAerodromeCreateInput,
  buildAerodromeObservationPatch,
  buildAerodromeStatusPatch,
  normalizeObservation,
  patchAerodromeToPrisma,
} from './aerodrome.prisma.mapper';

describe('aerodrome prisma builders', () => {
  const gid = 'f6a7b8c9-d0e1-2345-f678-901234567890';

  const baseCreate = (): CreateAerodromeDTO => ({
    groupId: gid,
    icao: 'SDXX',
    name: 'Campo Aviação Teste',
    latitude: '03°27\'18.50"S',
    longitude: '041°36\'16.91"W',
    altitude: '100',
  });

  it('create conecta o grupo, força isView=false e aplica os defaults do web', () => {
    const input = buildAerodromeCreateInput(
      { ...baseCreate(), municipality: 'São Paulo' },
      'actor-1',
    );
    expect(input.group).toEqual({ connect: { id: gid } });
    expect(input.municipality).toBe('São Paulo');
    expect(input.isView).toBe(false);
    expect(input.isOpen).toBe(true);
    expect(input.weatherStationDisplay).toBe(false);
    expect(input.lit).toBe(false);
    expect(input.fueling).toBe(false);
    expect(input.construction).toBe(false);
    expect(input.createdBy).toBe('actor-1');
  });

  it('patch parcial: escreve só o enviado; ausentes ficam undefined (no-op)', () => {
    const dto: UpdateAerodromeDTO = { name: 'Novo', isView: true };
    const patch = patchAerodromeToPrisma(dto, 'actor-2');
    expect(patch.name).toBe('Novo');
    expect(patch.isView).toBe(true);
    expect(patch.updatedBy).toBe('actor-2');
    /** Campos omitidos NÃO viram null (senão apagariam dados): ficam undefined. */
    expect(patch.group).toBeUndefined();
    expect(patch.icao).toBeUndefined();
    expect(patch.ciad).toBeUndefined();
    expect(patch.isOpen).toBeUndefined();
  });

  it('patch: groupId presente reconecta o grupo', () => {
    expect(patchAerodromeToPrisma({ groupId: gid }, 'a').group).toEqual({
      connect: { id: gid },
    });
  });

  it('patch: observação vazia enviada vira null; ausente fica undefined (no-op)', () => {
    expect(
      patchAerodromeToPrisma({ observation: '' }, 'a').observation,
    ).toBeNull();
    expect(patchAerodromeToPrisma({ observation: 'X' }, 'a').observation).toBe(
      'X',
    );
    expect(
      patchAerodromeToPrisma({ name: 'só nome' }, 'a').observation,
    ).toBeUndefined();
  });

  it('status patch altera só o campo informado + updatedBy', () => {
    expect(buildAerodromeStatusPatch('isOpen', false, 'a')).toEqual({
      isOpen: false,
      updatedBy: 'a',
    });
  });

  it('observation patch grava observação (null limpa) + updatedBy', () => {
    expect(buildAerodromeObservationPatch(null, 'a')).toEqual({
      observation: null,
      updatedBy: 'a',
    });
  });

  it('normalizeObservation: vazio/ausente → null; texto preservado', () => {
    expect(normalizeObservation('')).toBeNull();
    expect(normalizeObservation(undefined)).toBeNull();
    expect(normalizeObservation(null)).toBeNull();
    expect(normalizeObservation('Atenção')).toBe('Atenção');
  });

  it('create normaliza observação vazia para null', () => {
    expect(
      buildAerodromeCreateInput({ ...baseCreate(), observation: '' }, 'a')
        .observation,
    ).toBeNull();
  });
});
