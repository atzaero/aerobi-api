import {
  AuditAction,
  UserRole,
  TechnicalVisitImageSection,
} from '@/generated/prisma/client';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import type { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
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

/**
 * Asserta que a promise rejeita com `VALIDATION_FAILED` (400) e que a mensagem
 * final traz o detalhe específico interpolado — nunca o placeholder literal
 * `[DETAILS]` (regressão do bug da chave `MESSAGE` vs `DETAILS`).
 */
async function expectValidation(
  promise: Promise<unknown>,
  expectedDetail: string,
): Promise<void> {
  await expect(promise).rejects.toBeInstanceOf(CustomHttpException);
  await promise.catch((e) => {
    const err = e as CustomHttpException;
    expect(err.getErrorCode()).toBe(ErrorCode.VALIDATION_FAILED);
    const { message } = err.getResponse() as { message: string };
    expect(message).toContain(expectedDetail);
    expect(message).not.toContain('[DETAILS]');
  });
}

describe('AddTechnicalVisitImageService', () => {
  let service: AddTechnicalVisitImageService;
  let findById: jest.Mock;
  let create: jest.Mock;
  let upload: jest.Mock;
  let record: jest.Mock;

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
    record = jest.fn().mockResolvedValue(undefined);
    service = new AddTechnicalVisitImageService(
      { findById } as unknown as TechnicalVisitRepository,
      { create } as unknown as TechnicalVisitImageRepository,
      {
        upload,
        delete: jest.fn(),
        getPresignedUrl: jest.fn().mockResolvedValue('https://signed'),
      } as unknown as StorageService,
      new ErrorMessageService(),
      { record } as unknown as AuditRecorderService,
    );
  });

  it('404 quando visita não existe', async () => {
    findById.mockResolvedValue(null);
    await expect(
      service.execute(visitId, TechnicalVisitImageSection.fence, image, actor),
    ).rejects.toBeInstanceOf(CustomHttpException);
    expect(upload).not.toHaveBeenCalled();
  });

  describe('validação da imagem (com visita existente)', () => {
    beforeEach(() => {
      findById.mockResolvedValue(buildTechnicalVisitFixture({ id: visitId }));
    });

    it('rejeita imagem ausente com detalhe interpolado', async () => {
      await expectValidation(
        service.execute(
          visitId,
          TechnicalVisitImageSection.fence,
          undefined,
          actor,
        ),
        'a imagem é obrigatória',
      );
      expect(upload).not.toHaveBeenCalled();
    });

    it('rejeita imagem vazia (0 bytes) com detalhe interpolado', async () => {
      const empty: Express.Multer.File = { ...image, size: 0 };
      await expectValidation(
        service.execute(
          visitId,
          TechnicalVisitImageSection.fence,
          empty,
          actor,
        ),
        'não pode estar vazia',
      );
      expect(upload).not.toHaveBeenCalled();
    });

    it('rejeita mimetype não permitido com detalhe interpolado', async () => {
      const gif: Express.Multer.File = { ...image, mimetype: 'image/gif' };
      await expectValidation(
        service.execute(visitId, TechnicalVisitImageSection.fence, gif, actor),
        'jpg, png ou webp',
      );
      expect(upload).not.toHaveBeenCalled();
    });

    it('rejeita imagem acima de 5 MB com detalhe interpolado', async () => {
      const big: Express.Multer.File = { ...image, size: 6 * 1024 * 1024 };
      await expectValidation(
        service.execute(visitId, TechnicalVisitImageSection.fence, big, actor),
        'excede o limite de 5 MB',
      );
      expect(upload).not.toHaveBeenCalled();
    });

    it('rejeita conteúdo divergente do mimetype declarado (magic bytes)', async () => {
      const spoofed: Express.Multer.File = {
        ...image,
        mimetype: 'image/png',
        buffer: Buffer.from([0xff, 0xd8, 0xff]),
      };
      await expectValidation(
        service.execute(
          visitId,
          TechnicalVisitImageSection.fence,
          spoofed,
          actor,
        ),
        'não corresponde a uma imagem',
      );
      expect(upload).not.toHaveBeenCalled();
    });
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
    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuditAction.CREATE,
        entityType: 'technical_visit_image',
        entityId: saved.id,
      }),
      expect.anything(),
    );
  });

  it('não grava auditoria quando a validação falha', async () => {
    findById.mockResolvedValue(buildTechnicalVisitFixture({ id: visitId }));
    const gif: Express.Multer.File = { ...image, mimetype: 'image/gif' };
    await expectValidation(
      service.execute(visitId, TechnicalVisitImageSection.fence, gif, actor),
      'jpg, png ou webp',
    );
    expect(record).not.toHaveBeenCalled();
  });
});
