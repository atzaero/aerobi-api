import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import type { AerodromeRepository } from '../repositories/aerodrome.repository';
import { buildAerodromeWithGroupFixture } from '../testing/aerodrome.entity.fixture';

import { FindVisibleAerodromeByIcaoService } from './find-visible-aerodrome-by-icao.service';

describe('FindVisibleAerodromeByIcaoService', () => {
  let service: FindVisibleAerodromeByIcaoService;
  let findVisibleByIcao: jest.Mock;

  beforeEach(() => {
    findVisibleByIcao = jest.fn();
    const repo = { findVisibleByIcao } as unknown as AerodromeRepository;
    service = new FindVisibleAerodromeByIcaoService(
      repo,
      new ErrorMessageService(),
    );
  });

  it('sucesso: consulta pelo ICAO e projeta DTO público', async () => {
    findVisibleByIcao.mockResolvedValue(
      buildAerodromeWithGroupFixture({ icao: 'SJ4E', isView: true }),
    );

    const out = await service.execute({ icao: 'SJ4E' });

    expect(findVisibleByIcao).toHaveBeenCalledWith('SJ4E');
    expect(out).toMatchObject({ icao: 'SJ4E', uf: 'PI' });
    expect(out).not.toHaveProperty('isView');
    expect(out).not.toHaveProperty('emergencyPhone');
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
  });
});
