import type { CreateOperationalAerodromeDTO } from '../dtos/create-operational-aerodrome.dto';

import {
  buildOperationalAerodromeCreateInput,
  patchOperationalAerodromeToPrisma,
} from './operational-aerodrome.prisma.mapper';

describe('operational-aerodrome prisma mapper', () => {
  const gid = 'f6a7b8c9-d0e1-2345-f678-901234567890';

  const baseCreate = (): CreateOperationalAerodromeDTO => ({
    groupId: gid,
    icao: 'SDXX',
    name: 'Campo Aviação Teste',
    latitude: '-23.0',
    longitude: '-46.0',
    isOpen: true,
    isView: false,
  });

  it('build conecta group e propaga escalares restantes', () => {
    const input = buildOperationalAerodromeCreateInput({
      ...baseCreate(),
      municipality: 'São Paulo',
    });
    expect(input.group).toEqual({ connect: { id: gid } });
    expect(input.municipality).toBe('São Paulo');
    expect(input.icao).toBe('SDXX');
  });

  it('patch apenas com icao atualiza apenas esse campo', () => {
    expect(patchOperationalAerodromeToPrisma({ icao: 'SBSP' })).toEqual({
      icao: 'SBSP',
    });
  });
});
