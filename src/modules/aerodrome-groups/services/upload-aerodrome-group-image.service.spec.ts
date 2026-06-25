import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import type { StorageService } from '@/modules/storage/services/storage.service';

import type { AerodromeGroupImageRepository } from '../repositories/aerodrome-group-image.repository';
import type { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';
import { buildAerodromeGroupFixture } from '../testing/aerodrome-group.entity.fixture';

import { UploadAerodromeGroupImageService } from './upload-aerodrome-group-image.service';

const actor: AuthenticatedUser = {
  id: 'actor-1',
  email: 'admin@e',
  role: UserRole.ADMIN,
};

const id = '11111111-1111-4111-8111-111111111111';

function file(
  overrides: Partial<Express.Multer.File> = {},
): Express.Multer.File {
  return {
    mimetype: 'image/png',
    size: 1024,
    originalname: 'logo.png',
    buffer: Buffer.from('x'),
    ...overrides,
  } as Express.Multer.File;
}

async function expectErrorCode(
  promise: Promise<unknown>,
  code: ErrorCode,
): Promise<void> {
  await expect(promise).rejects.toBeInstanceOf(CustomHttpException);
  await promise.catch((e) =>
    expect((e as CustomHttpException).getErrorCode()).toBe(code),
  );
}

describe('UploadAerodromeGroupImageService', () => {
  let service: UploadAerodromeGroupImageService;
  let findById: jest.Mock;
  let createActiveImage: jest.Mock;
  let upload: jest.Mock;
  let del: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    createActiveImage = jest.fn();
    upload = jest.fn();
    del = jest.fn().mockResolvedValue(undefined);
    const groupRepo = { findById } as unknown as AerodromeGroupRepository;
    const imageRepo = {
      createActiveImage,
    } as unknown as AerodromeGroupImageRepository;
    const storage = {
      upload,
      delete: del,
      getPresignedUrl: jest.fn().mockResolvedValue('https://signed'),
    } as unknown as StorageService;
    service = new UploadAerodromeGroupImageService(
      groupRepo,
      imageRepo,
      storage,
      new ErrorMessageService(),
    );
  });

  it('404 quando o grupo não existe', async () => {
    findById.mockResolvedValue(null);
    await expectErrorCode(
      service.execute(id, file(), actor),
      ErrorCode.RESOURCE_NOT_FOUND,
    );
    expect(upload).not.toHaveBeenCalled();
  });

  it('400 quando a imagem está ausente', async () => {
    findById.mockResolvedValue(buildAerodromeGroupFixture({ id }));
    await expectErrorCode(
      service.execute(id, undefined, actor),
      ErrorCode.VALIDATION_FAILED,
    );
    expect(upload).not.toHaveBeenCalled();
  });

  it('400 quando o mimetype não é jpg/png/webp', async () => {
    findById.mockResolvedValue(buildAerodromeGroupFixture({ id }));
    await expectErrorCode(
      service.execute(id, file({ mimetype: 'image/gif' }), actor),
      ErrorCode.VALIDATION_FAILED,
    );
  });

  it('400 quando excede 5 MB', async () => {
    findById.mockResolvedValue(buildAerodromeGroupFixture({ id }));
    await expectErrorCode(
      service.execute(id, file({ size: 6 * 1024 * 1024 }), actor),
      ErrorCode.VALIDATION_FAILED,
    );
  });

  it('sucesso: upload, registra a imagem e devolve imageUrl presigned', async () => {
    findById
      .mockResolvedValueOnce(buildAerodromeGroupFixture({ id }))
      .mockResolvedValueOnce(
        buildAerodromeGroupFixture({ id, imageKey: 'groups/x/images/y.png' }),
      );
    createActiveImage.mockResolvedValue(undefined);
    upload.mockResolvedValue(undefined);

    const out = await service.execute(id, file(), actor);

    expect(upload).toHaveBeenCalledTimes(1);
    expect(createActiveImage).toHaveBeenCalledWith(
      expect.objectContaining({
        groupId: id,
        mimeType: 'image/png',
        originalFilename: 'logo.png',
        sizeBytes: 1024,
        actorId: actor.id,
      }),
    );
    expect(out.imageUrl).toBe('https://signed');
  });

  it('STORAGE_UPLOAD_FAILED quando o upload falha (sem registrar)', async () => {
    findById.mockResolvedValue(buildAerodromeGroupFixture({ id }));
    upload.mockRejectedValue(new Error('minio down'));
    await expectErrorCode(
      service.execute(id, file(), actor),
      ErrorCode.STORAGE_UPLOAD_FAILED,
    );
    expect(createActiveImage).not.toHaveBeenCalled();
  });

  it('compensa removendo o objeto se o registro falha após o upload', async () => {
    findById.mockResolvedValue(buildAerodromeGroupFixture({ id }));
    upload.mockResolvedValue(undefined);
    createActiveImage.mockRejectedValue(new Error('db error'));

    await expect(service.execute(id, file(), actor)).rejects.toThrow(
      'db error',
    );
    expect(del).toHaveBeenCalledTimes(1);
  });
});
