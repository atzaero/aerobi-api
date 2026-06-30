import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import type { StorageService } from '@/modules/storage/services/storage.service';

import type { GroupImageRepository } from '../repositories/group-image.repository';
import type { GroupRepository } from '../repositories/group.repository';
import { buildGroupFixture } from '../testing/group.entity.fixture';

import { RemoveGroupImageService } from './remove-group-image.service';

const actor: AuthenticatedUser = {
  id: 'actor-1',
  email: 'admin@e',
  role: UserRole.ADMIN,
};

const id = '11111111-1111-4111-8111-111111111111';

async function expectErrorCode(
  promise: Promise<unknown>,
  code: ErrorCode,
): Promise<void> {
  await expect(promise).rejects.toBeInstanceOf(CustomHttpException);
  await promise.catch((e) =>
    expect((e as CustomHttpException).getErrorCode()).toBe(code),
  );
}

describe('RemoveGroupImageService', () => {
  let service: RemoveGroupImageService;
  let findById: jest.Mock;
  let removeActiveImage: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    removeActiveImage = jest.fn();
    const groupRepo = { findById } as unknown as GroupRepository;
    const imageRepo = {
      removeActiveImage,
    } as unknown as GroupImageRepository;
    const storage = {
      getPresignedUrl: jest.fn().mockResolvedValue('https://signed'),
    } as unknown as StorageService;
    service = new RemoveGroupImageService(
      groupRepo,
      imageRepo,
      storage,
      new ErrorMessageService(),
    );
  });

  it('404 quando o grupo não existe', async () => {
    findById.mockResolvedValue(null);
    await expectErrorCode(
      service.execute(id, actor),
      ErrorCode.RESOURCE_NOT_FOUND,
    );
    expect(removeActiveImage).not.toHaveBeenCalled();
  });

  it('404 quando não há imagem ativa', async () => {
    findById.mockResolvedValue(buildGroupFixture({ id }));
    removeActiveImage.mockResolvedValue(null);
    await expectErrorCode(
      service.execute(id, actor),
      ErrorCode.RESOURCE_NOT_FOUND,
    );
  });

  it('sucesso: remove a ativa e zera imageKey (imageUrl null)', async () => {
    findById.mockResolvedValue(
      buildGroupFixture({ id, imageKey: 'groups/x/images/y.png' }),
    );
    removeActiveImage.mockResolvedValue(
      buildGroupFixture({ id, imageKey: null }),
    );

    const out = await service.execute(id, actor);

    expect(removeActiveImage).toHaveBeenCalledWith(id, actor.id);
    expect(out.imageUrl).toBeNull();
  });
});
