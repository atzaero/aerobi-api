import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import type { PilotLandingRepository } from '../repositories/pilot-landing.repository';
import { buildPilotLandingFixture } from '../testing/pilot-landing.entity.fixture';

import { RemovePilotLandingService } from './remove-pilot-landing.service';

describe('RemovePilotLandingService', () => {
  let service: RemovePilotLandingService;
  let findById: jest.Mock;
  let softDelete: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    softDelete = jest.fn();
    const repo = {
      findById,
      softDelete,
    } as unknown as PilotLandingRepository;
    service = new RemovePilotLandingService(repo, new ErrorMessageService());
  });

  const id = '11111111-1111-4111-8111-111111111111';

  it('404 quando o registo não existe', async () => {
    findById.mockResolvedValue(null);

    await expect(
      service.execute({ id, deletedBy: 'actor' }),
    ).rejects.toBeInstanceOf(CustomHttpException);
    expect(softDelete).not.toHaveBeenCalled();
  });

  it('soft delete e devolve entidade mapeada', async () => {
    const existing = buildPilotLandingFixture({ id });
    const deleted = buildPilotLandingFixture({
      id,
      deletedAt: new Date('2024-07-01T00:00:00.000Z'),
      deletedBy: 'actor',
    });
    findById.mockResolvedValue(existing);
    softDelete.mockResolvedValue(deleted);

    const out = await service.execute({ id, deletedBy: 'actor' });

    expect(softDelete).toHaveBeenCalledWith(id, 'actor');
    expect(out.deletedBy).toBe('actor');
    expect(out.deletedAt).toBe(deleted.deletedAt!.toISOString());
  });
});
