import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { AerodromeRepository } from '../repositories/aerodrome.repository';
import { buildAerodromeWithGroupFixture } from '../testing/aerodrome.entity.fixture';

import { SetAerodromeStatusService } from './set-aerodrome-status.service';

describe('SetAerodromeStatusService', () => {
  let service: SetAerodromeStatusService;
  let findById: jest.Mock;
  let update: jest.Mock;

  const id = '11111111-1111-4111-8111-111111111111';
  const actor: AuthenticatedUser = {
    id: 'c1',
    email: 'c@x',
    role: UserRole.COORDINATOR,
  };

  beforeEach(() => {
    findById = jest.fn();
    update = jest.fn();
    const repo = { findById, update } as unknown as AerodromeRepository;
    service = new SetAerodromeStatusService(repo, new ErrorMessageService());
  });

  it('404', async () => {
    findById.mockResolvedValue(null);
    try {
      await service.execute(id, { field: 'isOpen', value: false }, actor);
      throw new Error('expected');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    expect(update).not.toHaveBeenCalled();
  });

  it('altera só o campo informado + ator real', async () => {
    findById.mockResolvedValue(buildAerodromeWithGroupFixture({ id }));
    update.mockResolvedValue(
      buildAerodromeWithGroupFixture({ id, isOpen: false }),
    );
    await service.execute(id, { field: 'isOpen', value: false }, actor);
    expect(update).toHaveBeenCalledWith(id, {
      isOpen: false,
      updatedBy: actor.id,
    });
  });
});
