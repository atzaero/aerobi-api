import { Logger } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import type { UserRepository } from '@/modules/users/repositories/user.repository';

import { buildTechnicalVisitImageFixture } from '../testing/technical-visit-image.entity.fixture';
import { buildTechnicalVisitWithAerodromeFixture } from '../testing/technical-visit.entity.fixture';
import type { TechnicalVisitImageRepository } from '../repositories/technical-visit-image.repository';
import type { TechnicalVisitRepository } from '../repositories/technical-visit.repository';
import type { StorageService } from '@/modules/storage/services/storage.service';

import { ExportTechnicalVisitPdfService } from './export-technical-visit-pdf.service';

jest.mock('@/common/pdf/build-technical-visit-pdf', () => ({
  buildTechnicalVisitPdfBuffer: jest.fn().mockResolvedValue(Buffer.from('pdf')),
  buildTechnicalVisitPdfFilename: jest
    .fn()
    .mockReturnValue('visita-tecnica-SBCF.pdf'),
}));

describe('ExportTechnicalVisitPdfService', () => {
  const visitId = '11111111-1111-4111-8111-111111111111';
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('404 quando visita não existe', async () => {
    const service = new ExportTechnicalVisitPdfService(
      {
        findByIdWithAerodrome: jest.fn().mockResolvedValue(null),
      } as unknown as TechnicalVisitRepository,
      { findByVisitId: jest.fn() } as unknown as TechnicalVisitImageRepository,
      { download: jest.fn() } as unknown as StorageService,
      {
        findManyByIds: jest.fn().mockResolvedValue([]),
      } as unknown as UserRepository,
      new ErrorMessageService(),
    );

    await expect(service.execute(visitId)).rejects.toBeInstanceOf(
      CustomHttpException,
    );
    try {
      await service.execute(visitId);
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
  });

  it('gera PDF com filename derivado do ICAO', async () => {
    const visit = buildTechnicalVisitWithAerodromeFixture({ id: visitId });
    const image = buildTechnicalVisitImageFixture({
      technicalVisitId: visitId,
    });
    const download = jest.fn().mockResolvedValue(Buffer.from('img'));

    const service = new ExportTechnicalVisitPdfService(
      {
        findByIdWithAerodrome: jest.fn().mockResolvedValue(visit),
      } as unknown as TechnicalVisitRepository,
      {
        findByVisitId: jest.fn().mockResolvedValue([image]),
      } as unknown as TechnicalVisitImageRepository,
      { download } as unknown as StorageService,
      {
        findManyByIds: jest.fn().mockResolvedValue([]),
      } as unknown as UserRepository,
      new ErrorMessageService(),
    );

    const result = await service.execute(visitId);

    expect(download).toHaveBeenCalledWith(image.imageKey);
    expect(result.filename).toBe('visita-tecnica-SBCF.pdf');
    expect(result.buffer).toEqual(Buffer.from('pdf'));
  });

  it('gera PDF mesmo quando download de imagem falha', async () => {
    const visit = buildTechnicalVisitWithAerodromeFixture({ id: visitId });
    const image = buildTechnicalVisitImageFixture({
      technicalVisitId: visitId,
    });
    const download = jest.fn().mockRejectedValue(new Error('minio down'));

    const service = new ExportTechnicalVisitPdfService(
      {
        findByIdWithAerodrome: jest.fn().mockResolvedValue(visit),
      } as unknown as TechnicalVisitRepository,
      {
        findByVisitId: jest.fn().mockResolvedValue([image]),
      } as unknown as TechnicalVisitImageRepository,
      { download } as unknown as StorageService,
      {
        findManyByIds: jest.fn().mockResolvedValue([]),
      } as unknown as UserRepository,
      new ErrorMessageService(),
    );

    const result = await service.execute(visitId);

    expect(result.buffer).toEqual(Buffer.from('pdf'));
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(image.id),
      expect.any(String),
    );
  });
});
