import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import type { TechnicalVisitRepository } from '../repositories/technical-visit.repository';
import { buildTechnicalVisitFixture } from '../testing/technical-visit.entity.fixture';

import { RemoveTechnicalVisitService } from './remove-technical-visit.service';

describe('RemoveTechnicalVisitService', () => {
  let service: RemoveTechnicalVisitService;
  let findById: jest.Mock;
  let softDelete: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    softDelete = jest.fn();
    const repo = {
      findById,
      softDelete,
    } as unknown as TechnicalVisitRepository;
    service = new RemoveTechnicalVisitService(repo, new ErrorMessageService());
  });

  const id = '11111111-1111-4111-8111-111111111111';

  it('404', async () => {
    findById.mockResolvedValue(null);
    try {
      await service.execute({ id, deletedBy: 'a' });
      throw new Error('expected');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
  });

  it('soft delete', async () => {
    findById.mockResolvedValue(buildTechnicalVisitFixture({ id }));
    softDelete.mockResolvedValue(
      buildTechnicalVisitFixture({
        id,
        deletedBy: 'b',
        deletedAt: new Date('2026-02-02T00:00:00.000Z'),
      }),
    );
    await service.execute({ id, deletedBy: 'b' });
    expect(softDelete).toHaveBeenCalledWith(id, 'b');
  });
});
