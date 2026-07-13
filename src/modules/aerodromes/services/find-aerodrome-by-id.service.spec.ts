import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import type { AerodromeFileUrlsService } from '@/modules/documents/services/aerodrome-file-urls.service';

import type { AerodromeRepository } from '../repositories/aerodrome.repository';
import { buildAerodromeWithGroupFixture } from '../testing/aerodrome.entity.fixture';

import { FindAerodromeByIdService } from './find-aerodrome-by-id.service';

describe('FindAerodromeByIdService', () => {
  let service: FindAerodromeByIdService;
  let findById: jest.Mock;
  let resolveFileUrls: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    resolveFileUrls = jest
      .fn()
      .mockResolvedValue({ imgUrl: null, kmlUrl: null });
    const repo = { findById } as unknown as AerodromeRepository;
    const fileUrls = {
      resolve: resolveFileUrls,
    } as unknown as AerodromeFileUrlsService;
    service = new FindAerodromeByIdService(
      repo,
      new ErrorMessageService(),
      fileUrls,
    );
  });

  const id = '11111111-1111-4111-8111-111111111111';

  it('sucesso: expõe uf derivada do grupo', async () => {
    findById.mockResolvedValue(buildAerodromeWithGroupFixture({ id }));
    const out = await service.execute({ id });
    expect(out).toMatchObject({ id, uf: 'PI' });
  });

  it('resolve imgUrl/kmlUrl on-read dos documentos ativos', async () => {
    findById.mockResolvedValue(buildAerodromeWithGroupFixture({ id }));
    resolveFileUrls.mockResolvedValue({
      imgUrl: 'https://minio/i.jpg',
      kmlUrl: 'https://minio/k.kmz',
    });
    const out = await service.execute({ id });
    expect(resolveFileUrls).toHaveBeenCalledWith(id);
    expect(out.imgUrl).toBe('https://minio/i.jpg');
    expect(out.kmlUrl).toBe('https://minio/k.kmz');
  });

  it('404 (não resolve arquivos)', async () => {
    findById.mockResolvedValue(null);
    try {
      await service.execute({ id });
      throw new Error('expected');
    } catch (e) {
      expect(e).toBeInstanceOf(CustomHttpException);
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    expect(resolveFileUrls).not.toHaveBeenCalled();
  });
});
