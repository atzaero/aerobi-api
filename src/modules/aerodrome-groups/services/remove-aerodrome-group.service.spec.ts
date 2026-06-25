import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import type { StorageService } from '@/modules/storage/services/storage.service';

import type { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';
import { buildAerodromeGroupFixture } from '../testing/aerodrome-group.entity.fixture';

import { RemoveAerodromeGroupService } from './remove-aerodrome-group.service';

const actor: AuthenticatedUser = {
  id: 'actor-1',
  email: 'admin@e',
  role: UserRole.ADMIN,
};

const storage = {
  getPresignedUrl: jest.fn(),
} as unknown as StorageService;

describe('RemoveAerodromeGroupService', () => {
  let service: RemoveAerodromeGroupService;
  let findById: jest.Mock;
  let softDeleteWithCascade: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    softDeleteWithCascade = jest.fn();
    const repo = {
      findById,
      softDeleteWithCascade,
    } as unknown as AerodromeGroupRepository;
    service = new RemoveAerodromeGroupService(
      repo,
      storage,
      new ErrorMessageService(),
    );
  });

  const id = '11111111-1111-4111-8111-111111111111';

  it('404', async () => {
    findById.mockResolvedValue(null);
    try {
      await service.execute(id, actor);
      throw new Error('expected');
    } catch (e) {
      expect(e).toBeInstanceOf(CustomHttpException);
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    expect(softDeleteWithCascade).not.toHaveBeenCalled();
  });

  it('cascata: deletedBy = ator e devolve affectedAerodromes', async () => {
    findById.mockResolvedValue(buildAerodromeGroupFixture({ id }));
    const group = buildAerodromeGroupFixture({
      id,
      deletedBy: actor.id,
      deletedAt: new Date('2025-01-01T00:00:00.000Z'),
    });
    softDeleteWithCascade.mockResolvedValue({ group, affectedAerodromes: 2 });

    const out = await service.execute(id, actor);

    expect(softDeleteWithCascade).toHaveBeenCalledWith(id, actor.id);
    expect(out.id).toBe(id);
    expect(out.affectedAerodromes).toBe(2);
  });
});
