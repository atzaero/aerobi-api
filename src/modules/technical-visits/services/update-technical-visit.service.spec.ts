import { UserRole } from '@/generated/prisma/client';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { buildAuthenticatedUserFixture } from '@/modules/auth/testing/authenticated-user.fixtures';
import type { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { UserRepository } from '@/modules/users/repositories/user.repository';

import type { TechnicalVisitRepository } from '../repositories/technical-visit.repository';
import { buildTechnicalVisitWithAerodromeFixture } from '../testing/technical-visit.entity.fixture';

import { UpdateTechnicalVisitService } from './update-technical-visit.service';

const actor = buildAuthenticatedUserFixture({
  id: '33333333-3333-4333-8333-333333333333',
  email: 'actor@test.com',
  role: UserRole.ADMIN,
});

describe('UpdateTechnicalVisitService', () => {
  let service: UpdateTechnicalVisitService;
  let findByIdWithAerodrome: jest.Mock;
  let update: jest.Mock;

  beforeEach(() => {
    findByIdWithAerodrome = jest.fn();
    update = jest.fn();
    const repo = {
      findByIdWithAerodrome,
      update,
    } as unknown as TechnicalVisitRepository;
    service = new UpdateTechnicalVisitService(
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
    await expect(
      service.execute({ id, hasFence: true }, actor),
    ).rejects.toBeInstanceOf(CustomHttpException);
    try {
      await service.execute({ id, hasFence: true }, actor);
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    expect(update).not.toHaveBeenCalled();
  });

  it('append modifierUsers no patch', async () => {
    const existing = buildTechnicalVisitWithAerodromeFixture({
      id,
      modifierUsers: ['u1'],
      modifierAtTimes: [new Date('2024-06-01T12:00:00.000Z')],
    });
    findByIdWithAerodrome.mockResolvedValueOnce(existing);
    update.mockResolvedValue(existing);
    await service.execute({ id, hasFence: true }, actor);
    expect(update).toHaveBeenCalledTimes(1);
    const [, patch] = update.mock.calls[0] as [
      string,
      {
        hasFence?: boolean;
        modifierUsers: string[];
        modifierAtTimes: Date[];
        updatedBy: string;
      },
    ];
    expect(patch).toMatchObject({
      hasFence: true,
      modifierUsers: ['u1', actor.id],
      updatedBy: actor.id,
    });
    expect(patch.modifierAtTimes).toHaveLength(2);
  });
});
