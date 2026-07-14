import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import type { AerodromeFileUrlsService } from '@/modules/documents/services/aerodrome-file-urls.service';

import type { AerodromeRepository } from '../repositories/aerodrome.repository';
import { buildAerodromeVisibleWithGroupFixture } from '../testing/aerodrome.entity.fixture';

import { FindVisibleAerodromeByIcaoService } from './find-visible-aerodrome-by-icao.service';

describe('FindVisibleAerodromeByIcaoService', () => {
  let service: FindVisibleAerodromeByIcaoService;
  let findVisibleByIcao: jest.Mock;
  let resolveFileUrls: jest.Mock;

  const id = '11111111-1111-4111-8111-111111111111';

  beforeEach(() => {
    findVisibleByIcao = jest.fn();
    resolveFileUrls = jest
      .fn()
      .mockResolvedValue({ imgUrl: null, kmlUrl: null });
    const repo = { findVisibleByIcao } as unknown as AerodromeRepository;
    const fileUrls = {
      resolve: resolveFileUrls,
    } as unknown as AerodromeFileUrlsService;
    service = new FindVisibleAerodromeByIcaoService(
      repo,
      new ErrorMessageService(),
      fileUrls,
    );
  });

  it('sucesso: consulta pelo ICAO e projeta DTO público', async () => {
    findVisibleByIcao.mockResolvedValue(
      buildAerodromeVisibleWithGroupFixture({ icao: 'SJ4E', isView: true }),
    );

    const out = await service.execute({ icao: 'SJ4E' });

    expect(findVisibleByIcao).toHaveBeenCalledWith('SJ4E');
    expect(out).toMatchObject({ icao: 'SJ4E', uf: 'PI', geojson: null });
    expect(out).not.toHaveProperty('isView');
    expect(out).not.toHaveProperty('emergencyPhone');
  });

  it('resolve imgUrl/kmlUrl on-read dos documentos ativos', async () => {
    findVisibleByIcao.mockResolvedValue(
      buildAerodromeVisibleWithGroupFixture({
        id,
        icao: 'SJ4E',
        isView: true,
      }),
    );
    resolveFileUrls.mockResolvedValue({
      imgUrl: 'https://minio/i.jpg',
      kmlUrl: 'https://minio/k.kmz',
    });

    const out = await service.execute({ icao: 'SJ4E' });

    expect(resolveFileUrls).toHaveBeenCalledWith(id);
    expect(out.imgUrl).toBe('https://minio/i.jpg');
    expect(out.kmlUrl).toBe('https://minio/k.kmz');
  });

  it('404 quando inexistente ou não visível', async () => {
    findVisibleByIcao.mockResolvedValue(null);
    const promise = service.execute({ icao: 'XXXX' });
    await expect(promise).rejects.toBeInstanceOf(CustomHttpException);
    await promise.catch((e) =>
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      ),
    );
    expect(resolveFileUrls).not.toHaveBeenCalled();
  });
});
