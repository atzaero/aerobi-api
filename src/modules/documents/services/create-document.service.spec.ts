import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { AuditAction, Uf, UserRole } from '@/generated/prisma/client';
import type { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import type { StorageService } from '@/modules/storage/services/storage.service';
import type { UserRepository } from '@/modules/users/repositories/user.repository';

import type { DocumentRepository } from '../repositories/document.repository';
import { buildDocumentFixture } from '../testing/document.entity.fixture';

import { CreateDocumentService } from './create-document.service';

const admin: AuthenticatedUser = {
  id: 'admin-1',
  email: 'a@a.com',
  role: UserRole.ADMIN,
};
const aid = '22222222-2222-4222-8222-222222222222';

function multerFile(
  overrides: Partial<Express.Multer.File> = {},
): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: 'doc.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    size: 1234,
    buffer: Buffer.from('pdf'),
    destination: '',
    filename: '',
    path: '',
    ...overrides,
  } as Express.Multer.File;
}

describe('CreateDocumentService', () => {
  let service: CreateDocumentService;
  let findAerodromeForScope: jest.Mock;
  let create: jest.Mock;
  let upload: jest.Mock;
  let del: jest.Mock;
  let getPresignedUrl: jest.Mock;
  let record: jest.Mock;

  beforeEach(() => {
    findAerodromeForScope = jest
      .fn()
      .mockResolvedValue({ groupId: 'grp-1', uf: Uf.MG });
    create = jest
      .fn()
      .mockResolvedValue(buildDocumentFixture({ aerodromeId: aid }));
    upload = jest.fn().mockResolvedValue(undefined);
    del = jest.fn().mockResolvedValue(undefined);
    getPresignedUrl = jest.fn().mockResolvedValue('https://signed');
    record = jest.fn().mockResolvedValue(undefined);
    service = new CreateDocumentService(
      { findAerodromeForScope, create } as unknown as DocumentRepository,
      { upload, delete: del, getPresignedUrl } as unknown as StorageService,
      { findActiveById: jest.fn() } as unknown as UserRepository,
      new ErrorMessageService(),
      { record } as unknown as AuditRecorderService,
    );
  });

  it('sobe, persiste, audita CREATE e devolve url', async () => {
    const out = await service.execute(
      { aerodromeId: aid, type: 'extra' },
      multerFile(),
      admin,
    );
    expect(upload).toHaveBeenCalled();
    expect(create).toHaveBeenCalled();
    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuditAction.CREATE,
        entityType: 'document',
      }),
      expect.anything(),
    );
    expect(out.url).toBe('https://signed');
    expect(out.type).toBe('extra');
  });

  it('arquivo ausente → 400, não sobe', async () => {
    try {
      await service.execute(
        { aerodromeId: aid, type: 'extra' },
        undefined,
        admin,
      );
      throw new Error('expected');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.VALIDATION_FAILED,
      );
    }
    expect(upload).not.toHaveBeenCalled();
  });

  it('aeródromo fora do escopo → 404, não sobe', async () => {
    findAerodromeForScope.mockResolvedValue(null);
    await expect(
      service.execute({ aerodromeId: aid, type: 'extra' }, multerFile(), admin),
    ).rejects.toBeInstanceOf(CustomHttpException);
    expect(upload).not.toHaveBeenCalled();
  });

  it('falha no create → compensa removendo o objeto órfão e propaga', async () => {
    create.mockRejectedValue(new Error('db down'));
    await expect(
      service.execute({ aerodromeId: aid, type: 'extra' }, multerFile(), admin),
    ).rejects.toThrow('db down');
    expect(del).toHaveBeenCalled();
  });
});
