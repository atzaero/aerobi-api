import type { AviascanReadingsPaginatedResponse } from '../types/aviascan.types';
import {
  isAviascanReadingsEnvelope,
  mapAviascanReadings,
} from './normalize-aviascan-readings.util';

const BASE_URL = 'https://aviascanapi.lmpierin.com.br';

const VALID_META = {
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 1,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

describe('isAviascanReadingsEnvelope', () => {
  it('accepts a well-formed envelope', () => {
    expect(isAviascanReadingsEnvelope({ data: [], meta: VALID_META })).toBe(
      true,
    );
  });

  it('rejects null', () => {
    expect(isAviascanReadingsEnvelope(null)).toBe(false);
  });

  it('rejects non-objects', () => {
    expect(isAviascanReadingsEnvelope('x')).toBe(false);
    expect(isAviascanReadingsEnvelope(42)).toBe(false);
  });

  it('rejects when data is missing or not an array', () => {
    expect(isAviascanReadingsEnvelope({ meta: VALID_META })).toBe(false);
    expect(isAviascanReadingsEnvelope({ data: null, meta: VALID_META })).toBe(
      false,
    );
    expect(isAviascanReadingsEnvelope({ data: {}, meta: VALID_META })).toBe(
      false,
    );
  });

  it('rejects when meta is missing or null', () => {
    expect(isAviascanReadingsEnvelope({ data: [] })).toBe(false);
    expect(isAviascanReadingsEnvelope({ data: [], meta: null })).toBe(false);
  });
});

describe('mapAviascanReadings', () => {
  it('completes relative image_path with the base URL and preserves meta', () => {
    const envelope = {
      data: [
        {
          id: 1,
          registration: 'PS-KDV',
          confidence: '0.9',
          reading_datetime: '2026-05-29T16:52:39.000Z',
          reading_status: null,
          revisor_id: null,
          image_path: '/uploads/abc.jpg',
          comments: null,
          aerodrome: 'SSCF',
        },
      ],
      meta: VALID_META,
    } satisfies AviascanReadingsPaginatedResponse;

    const actual = mapAviascanReadings(envelope, BASE_URL);

    expect(actual.data[0].image_path).toBe(
      'https://aviascanapi.lmpierin.com.br/uploads/abc.jpg',
    );
    expect(actual.meta).toEqual(VALID_META);
  });

  it('keeps null image_path as null', () => {
    const envelope = {
      data: [
        {
          id: 2,
          registration: 'PU-OLS',
          confidence: '0.8',
          reading_datetime: '2026-05-29T16:52:39.000Z',
          reading_status: null,
          revisor_id: null,
          image_path: null,
          comments: null,
          aerodrome: 'SSCF',
        },
      ],
      meta: VALID_META,
    } satisfies AviascanReadingsPaginatedResponse;

    const actual = mapAviascanReadings(envelope, BASE_URL);

    expect(actual.data[0].image_path).toBeNull();
  });
});
