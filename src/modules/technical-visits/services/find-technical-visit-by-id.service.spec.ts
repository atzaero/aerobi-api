import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import type { UserRepository } from '@/modules/users/repositories/user.repository';

import type { TechnicalVisitRepository } from '../repositories/technical-visit.repository';
import { buildTechnicalVisitWithAerodromeFixture } from '../testing/technical-visit.entity.fixture';

import { FindTechnicalVisitByIdService } from './find-technical-visit-by-id.service';

describe('FindTechnicalVisitByIdService', () => {
  let service: FindTechnicalVisitByIdService;
  let findByIdWithAerodrome: jest.Mock;

  beforeEach(() => {
    findByIdWithAerodrome = jest.fn();
    const repo = {
      findByIdWithAerodrome,
    } as unknown as TechnicalVisitRepository;
    service = new FindTechnicalVisitByIdService(
      repo,
      {
        findManyByIds: jest.fn().mockResolvedValue([]),
      } as unknown as UserRepository,
      new ErrorMessageService(),
    );
  });

  const id = '11111111-1111-4111-8111-111111111111';

  it('sucesso', async () => {
    const row = buildTechnicalVisitWithAerodromeFixture({ id });
    findByIdWithAerodrome.mockResolvedValue(row);
    const out = await service.execute({ id });
    expect(out.id).toBe(id);
    expect(out.icao).toBe('SBGO');
  });

  it('404', async () => {
    findByIdWithAerodrome.mockResolvedValue(null);
    await expect(service.execute({ id })).rejects.toBeInstanceOf(
      CustomHttpException,
    );
    try {
      await service.execute({ id });
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
  });
});
