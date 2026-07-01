import type { CreateAerodromeDTO } from '../dtos/create-aerodrome.dto';
import type { UpdateAerodromeDTO } from '../dtos/update-aerodrome.dto';

import {
  buildAerodromeCreateInput,
  buildAerodromeObservationPatch,
  buildAerodromeStatusPatch,
  buildAerodromeUpdateInput,
  normalizeObservation,
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

  it('update reconecta o grupo, respeita isView e grava updatedBy', () => {
    const dto: UpdateAerodromeDTO = { ...baseCreate(), isView: true };
    const input = buildAerodromeUpdateInput(dto, 'actor-2');
    expect(input.group).toEqual({ connect: { id: gid } });
    expect(input.isView).toBe(true);
    expect(input.updatedBy).toBe('actor-2');
  });

  it('update: opcionais ausentes viram null (full edit)', () => {
    const input = buildAerodromeUpdateInput(baseCreate(), 'actor-2');
    expect(input.ciad).toBeNull();
    expect(input.municipality).toBeNull();
    expect(input.emergencyPhone).toBeNull();
    expect(input.isView).toBe(false);
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

  it('create/update normalizam observação vazia para null', () => {
    expect(
      buildAerodromeCreateInput({ ...baseCreate(), observation: '' }, 'a')
        .observation,
    ).toBeNull();
    expect(
      buildAerodromeUpdateInput({ ...baseCreate(), observation: '' }, 'a')
        .observation,
    ).toBeNull();
  });
});
