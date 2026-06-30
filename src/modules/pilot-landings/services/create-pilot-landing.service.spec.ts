import { CreatePilotLandingDTO } from '../dtos/create-pilot-landing.dto';
import { buildPilotLandingCreateInput } from '../mappers/pilot-landing.prisma.mapper';
import type { PilotLandingRepository } from '../repositories/pilot-landing.repository';
import { buildPilotLandingFixture } from '../testing/pilot-landing.entity.fixture';

import { CreatePilotLandingService } from './create-pilot-landing.service';

describe('CreatePilotLandingService', () => {
  let service: CreatePilotLandingService;
  let create: jest.Mock;

  beforeEach(() => {
    create = jest.fn();
    const repo = { create } as unknown as PilotLandingRepository;
    service = new CreatePilotLandingService(repo);
  });

  const buildDto = (): CreatePilotLandingDTO => ({
    aerodromeId: '22222222-2222-4222-8222-222222222222',
    registration: 'PT-ABC',
    localName: 'Campo',
    localIcao: 'SDXX',
    checked: true,
    imagesPath: 'p',
    landingAt: new Date('2024-01-02T10:00:00.000Z'),
    createdBy: 'u1',
  });

  it('cria com buildPilotLandingCreateInput e devolve DTO mapeado', async () => {
    const dto = buildDto();
    const saved = buildPilotLandingFixture();
    create.mockResolvedValue(saved);

    const out = await service.execute(dto);

    expect(create).toHaveBeenCalledWith(buildPilotLandingCreateInput(dto));
    expect(out).toMatchObject({
      id: saved.id,
      registration: saved.registration,
      aerodromeId: saved.aerodromeId,
    });
  });
});
