import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import {
  AuditAction,
  DocumentType,
  Uf,
  UserRole,
} from '@/generated/prisma/client';
import type { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import type { GenerateGeojsonService } from '@/modules/geojsons/services/generate-geojson.service';
import type { StorageService } from '@/modules/storage/services/storage.service';
import type { UserRepository } from '@/modules/users/repositories/user.repository';

import type { DocumentRepository } from '../repositories/document.repository';
import { buildDocumentFixture } from '../testing/document.entity.fixture';

import { UploadAerodromeFileService } from './upload-aerodrome-file.service';

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
    originalname: 'mapa.kml',
    encoding: '7bit',
    mimetype: 'application/vnd.google-earth.kml+xml',
    size: 100,
    buffer: Buffer.from('<kml/>'),
    destination: '',
    filename: '',
    path: '',
    ...overrides,
  } as Express.Multer.File;
}

describe('UploadAerodromeFileService', () => {
  let service: UploadAerodromeFileService;
  let findAerodromeForScope: jest.Mock;
  let createSupersedingActive: jest.Mock;
  let upload: jest.Mock;
  let record: jest.Mock;
  let generate: jest.Mock;

  beforeEach(() => {
    findAerodromeForScope = jest
      .fn()
      .mockResolvedValue({ groupId: 'grp-1', uf: Uf.MG });
    createSupersedingActive = jest
      .fn()
      .mockResolvedValue(
        buildDocumentFixture({ aerodromeId: aid, type: DocumentType.KML }),
      );
    upload = jest.fn().mockResolvedValue(undefined);
    record = jest.fn().mockResolvedValue(undefined);
    generate = jest.fn().mockResolvedValue({ status: 'READY', geojson: {} });
    service = new UploadAerodromeFileService(
      {
        findAerodromeForScope,
        createSupersedingActive,
      } as unknown as DocumentRepository,
      {
        upload,
        delete: jest.fn(),
        getPresignedUrl: jest.fn().mockResolvedValue('https://signed'),
      } as unknown as StorageService,
      { findActiveById: jest.fn() } as unknown as UserRepository,
      new ErrorMessageService(),
      { record } as unknown as AuditRecorderService,
      { execute: generate } as unknown as GenerateGeojsonService,
    );
  });

  it('KML válido (mode update): cria, mantém 1 ativo, dispara geojson, audita UPDATE', async () => {
    await service.execute(
      { aerodromeId: aid, type: 'kml', mode: 'update' },
      multerFile(),
      admin,
    );
    expect(createSupersedingActive).toHaveBeenCalledWith(
      expect.objectContaining({ uploadedBy: admin.id }),
      aid,
      DocumentType.KML,
      admin.id,
    );
    expect(generate).toHaveBeenCalledWith(
      expect.objectContaining({ aerodromeId: aid }),
      expect.anything(),
    );
    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuditAction.UPDATE,
        entityType: 'document',
      }),
      expect.anything(),
    );
  });

  it('IMAGE válida (mode create): não dispara geojson, audita CREATE', async () => {
    createSupersedingActive.mockResolvedValue(
      buildDocumentFixture({ aerodromeId: aid, type: DocumentType.IMAGE }),
    );
    await service.execute(
      { aerodromeId: aid, type: 'image', mode: 'create' },
      multerFile({ originalname: 'foto.png', mimetype: 'image/png' }),
      admin,
    );
    expect(generate).not.toHaveBeenCalled();
    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({ action: AuditAction.CREATE }),
      expect.anything(),
    );
  });

  it('arquivo ausente → 400', async () => {
    await expect(
      service.execute(
        { aerodromeId: aid, type: 'kml', mode: 'create' },
        undefined,
        admin,
      ),
    ).rejects.toBeInstanceOf(CustomHttpException);
    expect(upload).not.toHaveBeenCalled();
  });

  it('mimetype/extensão inválido → 400', async () => {
    try {
      await service.execute(
        { aerodromeId: aid, type: 'kml', mode: 'create' },
        multerFile({ originalname: 'x.txt', mimetype: 'text/plain' }),
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

  it('geração de geojson falha → não derruba o upload (best-effort)', async () => {
    generate.mockRejectedValue(new Error('boom'));
    await expect(
      service.execute(
        { aerodromeId: aid, type: 'kml', mode: 'create' },
        multerFile(),
        admin,
      ),
    ).resolves.toBeDefined();
    expect(createSupersedingActive).toHaveBeenCalled();
  });
});
