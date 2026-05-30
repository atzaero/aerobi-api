import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import { AviascanHttpService } from './aviascan-http.service';
import { AviascanReadingsService } from './aviascan-readings.service';

const BASE_URL = 'https://aviascanapi.lmpierin.com.br';

const UPSTREAM_PAGE = {
  data: [
    {
      id: 1,
      registration: 'PS-KDV',
      aerodrome: 'SSCF',
      image_path: '/uploads/88768ccd-a244-4319-b9b2-7639a3e7d65d.jpg',
    },
  ],
  meta: {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

function makeErrorMessages(): ErrorMessageService {
  return {
    getMessage: jest.fn(() => 'erro externo'),
  } as unknown as ErrorMessageService;
}

describe('AviascanReadingsService', () => {
  let service: AviascanReadingsService;
  let requestJson: jest.Mock;
  let getBaseUrl: jest.Mock;

  beforeEach(() => {
    requestJson = jest.fn();
    getBaseUrl = jest.fn().mockReturnValue(BASE_URL);
    const http = {
      requestJson,
      getBaseUrl,
    } as unknown as AviascanHttpService;
    service = new AviascanReadingsService(http, makeErrorMessages());
  });

  it('forwards pagination and filters to AviaScan', async () => {
    requestJson.mockResolvedValue(UPSTREAM_PAGE);

    await service.execute({
      page: 2,
      limit: 25,
      registration: 'PS-KDV',
      aerodrome: 'SSCF',
      start_date: '2026-05-01',
      end_date: '2026-05-31',
    });

    expect(requestJson).toHaveBeenCalledWith({
      method: 'GET',
      path: '/api/readings/paginated',
      query: {
        page: 2,
        limit: 25,
        registration: 'PS-KDV',
        aerodrome: 'SSCF',
        start_date: '2026-05-01',
        end_date: '2026-05-31',
      },
    });
  });

  it('defaults page to 1 and limit to 10 when not provided', async () => {
    requestJson.mockResolvedValue(UPSTREAM_PAGE);

    await service.execute({});

    expect(requestJson).toHaveBeenCalledWith({
      method: 'GET',
      path: '/api/readings/paginated',
      query: {
        page: 1,
        limit: 10,
        registration: undefined,
        aerodrome: undefined,
        start_date: undefined,
        end_date: undefined,
      },
    });
  });

  it('completes image_path with the AviaScan base URL', async () => {
    requestJson.mockResolvedValue(UPSTREAM_PAGE);

    const actual = await service.execute({ page: 1 });

    expect(actual.data[0].image_path).toBe(
      'https://aviascanapi.lmpierin.com.br/uploads/88768ccd-a244-4319-b9b2-7639a3e7d65d.jpg',
    );
    expect(actual.meta).toEqual(UPSTREAM_PAGE.meta);
  });

  it('throws CustomHttpException (EXTERNAL_SERVICE_FAILED) when upstream shape is unexpected', async () => {
    requestJson.mockResolvedValue({ unexpected: true });

    const error = await service.execute({ page: 1 }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(CustomHttpException);
    const custom = error as CustomHttpException;
    expect(custom.getErrorCode()).toBe(ErrorCode.EXTERNAL_SERVICE_FAILED);
    expect(custom.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
  });
});
