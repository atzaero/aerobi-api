import {
  UserRole,
  TechnicalVisitImageSection,
} from '@/generated/prisma/client';

import type { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { buildAuthenticatedUserFixture } from '@/modules/auth/testing/authenticated-user.fixtures';

import { buildTechnicalVisitFixture } from '../testing/technical-visit.entity.fixture';
import { buildTechnicalVisitImageFixture } from '../testing/technical-visit-image.entity.fixture';
import type { TechnicalVisitImageRepository } from '../repositories/technical-visit-image.repository';
import type { TechnicalVisitRepository } from '../repositories/technical-visit.repository';
import type { StorageService } from '@/modules/storage/services/storage.service';

import { AddTechnicalVisitImageService } from './add-technical-visit-image.service';

const actor = buildAuthenticatedUserFixture({
  id: '33333333-3333-4333-8333-333333333333',
  email: 'actor@test.com',
  role: UserRole.ADMIN,
});

const visitId = '11111111-1111-4111-8111-111111111111';

describe('AddTechnicalVisitImageService', () => {
  let service: AddTechnicalVisitImageService;
  let findById: jest.Mock;
  let create: jest.Mock;
  let upload: jest.Mock;

  const image = {
    originalname: 'foto.jpg',
    mimetype: 'image/jpeg',
    size: 100,
    buffer: Buffer.from([0xff, 0xd8, 0xff]),
  } as Express.Multer.File;

  beforeEach(() => {
    findById = jest.fn();
    create = jest.fn();
    upload = jest.fn();
    service = new AddTechnicalVisitImageService(
      { findById } as unknown as TechnicalVisitRepository,
      { create } as unknown as TechnicalVisitImageRepository,
      {
        upload,
        delete: jest.fn(),
        getPresignedUrl: jest.fn().mockResolvedValue('https://signed'),
      } as unknown as StorageService,
      { getMessage: jest.fn() } as unknown as ErrorMessageService,
    );
  });

  it('404 quando visita não existe', async () => {
    findById.mockResolvedValue(null);
    await expect(
      service.execute(visitId, TechnicalVisitImageSection.fence, image, actor),
    ).rejects.toBeInstanceOf(CustomHttpException);
    expect(upload).not.toHaveBeenCalled();
  });

  it('rejeita imagem vazia', async () => {
    findById.mockResolvedValue(buildTechnicalVisitFixture({ id: visitId }));
    const empty: Express.Multer.File = { ...image, size: 0 };
    await expect(
      service.execute(visitId, TechnicalVisitImageSection.fence, empty, actor),
    ).rejects.toBeInstanceOf(CustomHttpException);
  });

  it('faz upload e persiste metadados', async () => {
    findById.mockResolvedValue(buildTechnicalVisitFixture({ id: visitId }));
    const saved = buildTechnicalVisitImageFixture();
    create.mockResolvedValue(saved);
    upload.mockResolvedValue(undefined);

    const out = await service.execute(
      visitId,
      TechnicalVisitImageSection.fence,
      image,
      actor,
    );

    expect(upload).toHaveBeenCalled();
    expect(create).toHaveBeenCalled();
    expect(out.id).toBe(saved.id);
    expect(out.imageUrl).toBe('https://signed');
    expect(out).not.toHaveProperty('imageKey');
  });
});
