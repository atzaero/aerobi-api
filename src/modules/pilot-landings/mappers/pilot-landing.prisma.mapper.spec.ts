import type { CreatePilotLandingDTO } from '../dtos/create-pilot-landing.dto';
import type { UpdatePilotLandingDTO } from '../dtos/update-pilot-landing.dto';

import {
  buildPilotLandingCreateInput,
  patchPilotLandingToPrisma,
} from './pilot-landing.prisma.mapper';

describe('pilot-landing prisma mapper', () => {
  const baseCreateDto = (): CreatePilotLandingDTO => ({
    registration: 'PT-XYZ',
    localName: 'Campo Teste',
    localIcao: 'SDQQ',
    checked: false,
    imagesPath: 'x/y',
    landingAt: new Date('2024-06-01T12:00:00.000Z'),
  });

  describe('buildPilotLandingCreateInput', () => {
    it('omits operational aerodrome quando id ausente', () => {
      const dto = baseCreateDto();
      const input = buildPilotLandingCreateInput(dto);
      expect(input.operationalAerodrome).toBeUndefined();
      expect(input.registration).toBe('PT-XYZ');
    });

    it('liga operationalAerodrome quando uuid presente', () => {
      const aid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      const dto = { ...baseCreateDto(), operationalAerodromeId: aid };
      const input = buildPilotLandingCreateInput(dto);
      expect(input.operationalAerodrome).toEqual({ connect: { id: aid } });
    });

    it('normaliza createdBy undefined quando omitido no DTO', () => {
      const input = buildPilotLandingCreateInput(baseCreateDto());
      expect(input.createdBy).toBeUndefined();
    });

    it('preserva createdBy quando definido', () => {
      const dto = { ...baseCreateDto(), createdBy: 'user-1' };
      const input = buildPilotLandingCreateInput(dto);
      expect(input.createdBy).toBe('user-1');
    });
  });

  describe('patchPilotLandingToPrisma', () => {
    it('retorna objeto vazio para DTO vazio', () => {
      expect(patchPilotLandingToPrisma({})).toEqual({});
    });

    it('desliga FK quando disconnectOperationalAerodrome=true (prioridade sobre connect)', () => {
      const dto = {
        disconnectOperationalAerodrome: true,
        operationalAerodromeId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      } as UpdatePilotLandingDTO;
      expect(patchPilotLandingToPrisma(dto).operationalAerodrome).toEqual({
        disconnect: true,
      });
    });

    it('liga aeródromo quando operationalAerodromeId definido sem disconnect', () => {
      const aid = 'b2c3d4e5-f6a7-8901-bcde-f23456789012';
      const dto = { operationalAerodromeId: aid };
      expect(patchPilotLandingToPrisma(dto).operationalAerodrome).toEqual({
        connect: { id: aid },
      });
    });

    it('copia apenas campos escalares presentes em dto', () => {
      expect(
        patchPilotLandingToPrisma({
          registration: 'NEW',
          checked: true,
        }),
      ).toMatchObject({
        registration: 'NEW',
        checked: true,
      });
    });
  });
});
