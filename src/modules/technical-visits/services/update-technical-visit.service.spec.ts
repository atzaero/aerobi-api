import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import { patchTechnicalVisitToPrisma } from '../mappers/technical-visit.prisma.mapper';
import type { TechnicalVisitRepository } from '../repositories/technical-visit.repository';
import { buildTechnicalVisitFixture } from '../testing/technical-visit.entity.fixture';

import { UpdateTechnicalVisitService } from './update-technical-visit.service';

describe('UpdateTechnicalVisitService', () => {
  let service: UpdateTechnicalVisitService;
  let findById: jest.Mock;
  let update: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    update = jest.fn();
    const repo = { findById, update } as unknown as TechnicalVisitRepository;
    service = new UpdateTechnicalVisitService(repo, new ErrorMessageService());
  });

  const id = '11111111-1111-4111-8111-111111111111';

  it('404', async () => {
    findById.mockResolvedValue(null);
    try {
      await service.execute({ id, hasFence: true });
      throw new Error('expected');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    expect(update).not.toHaveBeenCalled();
  });

  it('modifierUsers apenas no patch', async () => {
    findById.mockResolvedValue(buildTechnicalVisitFixture({ id }));
    const updated = buildTechnicalVisitFixture({
      id,
      modifierUsers: ['a', 'b'],
    });
    update.mockResolvedValue(updated);
    await service.execute({ id, modifierUsers: ['a', 'b'] });
    expect(update).toHaveBeenCalledWith(
      id,
      patchTechnicalVisitToPrisma({ modifierUsers: ['a', 'b'] }),
    );
  });

  it('aerodromeId gera connect fora do patch', async () => {
    const newAid = '33333333-3333-4333-8333-333333333333';
    findById.mockResolvedValue(buildTechnicalVisitFixture({ id }));
    update.mockResolvedValue(
      buildTechnicalVisitFixture({ id, aerodromeId: newAid }),
    );

    await service.execute({
      id,
      aerodromeId: newAid,
      hasFence: false,
    });

    expect(update).toHaveBeenCalledWith(
      id,
      expect.objectContaining({
        aerodrome: { connect: { id: newAid } },
        hasFence: false,
      }),
    );
  });
});
