import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import type { StorageService } from '@/modules/storage/services/storage.service';

import type { AerodromeGroupImageRepository } from '../repositories/aerodrome-group-image.repository';
import type { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';
import { buildAerodromeGroupFixture } from '../testing/aerodrome-group.entity.fixture';

import { RemoveAerodromeGroupImageService } from './remove-aerodrome-group-image.service';

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

describe('RemoveAerodromeGroupImageService', () => {
  let service: RemoveAerodromeGroupImageService;
  let findById: jest.Mock;
  let removeActiveImage: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    removeActiveImage = jest.fn();
    const groupRepo = { findById } as unknown as AerodromeGroupRepository;
    const imageRepo = {
      removeActiveImage,
    } as unknown as AerodromeGroupImageRepository;
    const storage = {
      getPresignedUrl: jest.fn().mockResolvedValue('https://signed'),
    } as unknown as StorageService;
    service = new RemoveAerodromeGroupImageService(
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
    findById.mockResolvedValue(buildAerodromeGroupFixture({ id }));
    removeActiveImage.mockResolvedValue(null);
    await expectErrorCode(
      service.execute(id, actor),
      ErrorCode.RESOURCE_NOT_FOUND,
    );
  });

  it('sucesso: remove a ativa e zera imageKey (imageUrl null)', async () => {
    findById.mockResolvedValue(
      buildAerodromeGroupFixture({ id, imageKey: 'groups/x/images/y.png' }),
    );
    removeActiveImage.mockResolvedValue(
      buildAerodromeGroupFixture({ id, imageKey: null }),
    );

    const out = await service.execute(id, actor);

    expect(removeActiveImage).toHaveBeenCalledWith(id, actor.id);
    expect(out.imageUrl).toBeNull();
  });
});
