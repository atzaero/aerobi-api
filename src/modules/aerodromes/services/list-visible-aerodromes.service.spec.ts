import type { AerodromeRepository } from '../repositories/aerodrome.repository';
import { buildAerodromeVisibleWithGroupFixture } from '../testing/aerodrome.entity.fixture';

import { ListVisibleAerodromesService } from './list-visible-aerodromes.service';

describe('ListVisibleAerodromesService', () => {
  let service: ListVisibleAerodromesService;
  let findAllVisible: jest.Mock;

  beforeEach(() => {
    findAllVisible = jest.fn();
    const repo = { findAllVisible } as unknown as AerodromeRepository;
    service = new ListVisibleAerodromesService(repo);
  });

  it('projeta todos os visíveis no DTO público (com groupId, sem PII/auditoria)', async () => {
    findAllVisible.mockResolvedValue([
      buildAerodromeVisibleWithGroupFixture({
        isView: true,
        emergencyPhone: '+5511999999999',
        createdBy: 'actor-1',
        registrationOrdinanceUrl: 'https://secret/ordinance.pdf',
      }),
    ]);

    const out = await service.execute();

    expect(findAllVisible).toHaveBeenCalledWith();
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: '11111111-1111-4111-8111-111111111111',
      groupId: '44444444-4444-4444-8444-444444444444',
      uf: 'PI',
      geojson: null,
    });
    expect(out[0]).not.toHaveProperty('isView');
    expect(out[0]).not.toHaveProperty('emergencyPhone');
    expect(out[0]).not.toHaveProperty('createdBy');
    expect(out[0]).not.toHaveProperty('registrationOrdinanceUrl');
    expect(out[0]).not.toHaveProperty('deletedAt');
  });
});
