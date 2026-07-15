import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { AerodromeRepository } from '../repositories/aerodrome.repository';
import { buildAerodromeWithGroupFixture } from '../testing/aerodrome.entity.fixture';

import { RemoveAerodromeService } from './remove-aerodrome.service';

describe('RemoveAerodromeService', () => {
  let service: RemoveAerodromeService;
  let findById: jest.Mock;
  let softDelete: jest.Mock;

  const id = '11111111-1111-4111-8111-111111111111';
  const admin: AuthenticatedUser = {
    id: 'admin-9',
    email: 'a@x',
    role: UserRole.ADMIN,
  };

  beforeEach(() => {
    findById = jest.fn();
    softDelete = jest.fn();
    const repo = {
      findById,
      softDelete,
    } as unknown as AerodromeRepository;
    service = new RemoveAerodromeService(repo, new ErrorMessageService());
  });

  it('404', async () => {
    findById.mockResolvedValue(null);
    try {
      await service.execute(id, admin);
      throw new Error('expected');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    expect(softDelete).not.toHaveBeenCalled();
  });

  it('soft delete com ator real', async () => {
    findById.mockResolvedValue(buildAerodromeWithGroupFixture({ id }));
    softDelete.mockResolvedValue(
      buildAerodromeWithGroupFixture({
        id,
        deletedBy: admin.id,
        deletedAt: new Date('2027-01-01T00:00:00.000Z'),
      }),
    );
    await service.execute(id, admin);
    expect(softDelete).toHaveBeenCalledWith(id, admin.id);
  });
});
