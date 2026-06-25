import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import type { StorageService } from '@/modules/storage/services/storage.service';

import { patchAerodromeGroupToPrisma } from '../mappers/aerodrome-group.prisma.mapper';
import type { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';
import { buildAerodromeGroupFixture } from '../testing/aerodrome-group.entity.fixture';

import { UpdateAerodromeGroupService } from './update-aerodrome-group.service';

const actor: AuthenticatedUser = {
  id: 'actor-1',
  email: 'admin@e',
  role: UserRole.ADMIN,
};

const storage = {
  getPresignedUrl: jest.fn(),
} as unknown as StorageService;

describe('UpdateAerodromeGroupService', () => {
  let service: UpdateAerodromeGroupService;
  let findById: jest.Mock;
  let update: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    update = jest.fn();
    const repo = { findById, update } as unknown as AerodromeGroupRepository;
    service = new UpdateAerodromeGroupService(
      repo,
      storage,
      new ErrorMessageService(),
    );
  });

  const id = '11111111-1111-4111-8111-111111111111';

  it('404 sem registo', async () => {
    findById.mockResolvedValue(null);
    try {
      await service.execute(id, { name: 'X' }, actor);
      throw new Error('expected');
    } catch (e) {
      expect(e).toBeInstanceOf(CustomHttpException);
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    expect(update).not.toHaveBeenCalled();
  });

  it('edita só name e grava updatedBy = ator', async () => {
    findById.mockResolvedValue(buildAerodromeGroupFixture({ id }));
    const updated = buildAerodromeGroupFixture({
      id,
      name: 'Novo nome',
      updatedBy: actor.id,
    });
    update.mockResolvedValue(updated);
    await service.execute(id, { name: 'Novo nome' }, actor);
    expect(update).toHaveBeenCalledWith(
      id,
      patchAerodromeGroupToPrisma({ name: 'Novo nome' }, actor.id),
    );
  });
});
