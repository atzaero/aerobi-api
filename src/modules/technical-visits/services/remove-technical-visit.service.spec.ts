import { UserRole } from '@/generated/prisma/client';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { buildAuthenticatedUserFixture } from '@/modules/auth/testing/authenticated-user.fixtures';
import type { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { UserRepository } from '@/modules/users/repositories/user.repository';

import type { TechnicalVisitRepository } from '../repositories/technical-visit.repository';
import {
  buildTechnicalVisitFixture,
  buildTechnicalVisitWithAerodromeFixture,
} from '../testing/technical-visit.entity.fixture';

import { RemoveTechnicalVisitService } from './remove-technical-visit.service';

const actor = buildAuthenticatedUserFixture({
  id: '33333333-3333-4333-8333-333333333333',
  email: 'actor@test.com',
  role: UserRole.ADMIN,
});

describe('RemoveTechnicalVisitService', () => {
  let service: RemoveTechnicalVisitService;
  let findByIdWithAerodrome: jest.Mock;
  let softDelete: jest.Mock;

  beforeEach(() => {
    findByIdWithAerodrome = jest.fn();
    softDelete = jest.fn();
    const repo = {
      findByIdWithAerodrome,
      softDelete,
    } as unknown as TechnicalVisitRepository;
    service = new RemoveTechnicalVisitService(
      repo,
      {
        findManyByIds: jest.fn().mockResolvedValue([]),
      } as unknown as UserRepository,
      new ErrorMessageService(),
      { record: jest.fn() } as unknown as AuditRecorderService,
    );
  });

  const id = '11111111-1111-4111-8111-111111111111';

  it('404', async () => {
    findByIdWithAerodrome.mockResolvedValue(null);
    try {
      await service.execute(id, actor);
      throw new Error('expected');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    expect(softDelete).not.toHaveBeenCalled();
  });

  it('soft delete com ator', async () => {
    const existing = buildTechnicalVisitWithAerodromeFixture({ id });
    findByIdWithAerodrome.mockResolvedValue(existing);
    softDelete.mockResolvedValue(
      buildTechnicalVisitFixture({
        id,
        deletedAt: new Date(),
        deletedBy: actor.id,
      }),
    );
    const out = await service.execute(id, actor);
    expect(softDelete).toHaveBeenCalledWith(id, actor.id);
    expect(out.deletedBy).toBe(actor.id);
  });
});
