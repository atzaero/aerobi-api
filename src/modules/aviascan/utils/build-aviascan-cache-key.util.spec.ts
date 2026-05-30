import {
  AVIASCAN_READINGS_CACHE_PREFIX,
  buildAviascanReadingsCacheKey,
} from './build-aviascan-cache-key.util';

describe('buildAviascanReadingsCacheKey', () => {
  it('applies page/limit defaults so equivalent queries share a key', () => {
    const withDefaults = buildAviascanReadingsCacheKey({});
    const explicit = buildAviascanReadingsCacheKey({ page: 1, limit: 10 });

    expect(withDefaults).toBe(explicit);
    expect(withDefaults).toBe(
      `${AVIASCAN_READINGS_CACHE_PREFIX}:page=1|limit=10|registration=|aerodrome=|start_date=|end_date=`,
    );
  });

  it('encodes all filters in a fixed order', () => {
    const key = buildAviascanReadingsCacheKey({
      page: 2,
      limit: 25,
      registration: 'PS-KDV',
      aerodrome: 'SSCF',
      start_date: '2026-05-01',
      end_date: '2026-05-31',
    });

    expect(key).toBe(
      `${AVIASCAN_READINGS_CACHE_PREFIX}:page=2|limit=25|registration=PS-KDV|aerodrome=SSCF|start_date=2026-05-01|end_date=2026-05-31`,
    );
  });

  it('produces different keys for different filters', () => {
    const a = buildAviascanReadingsCacheKey({ aerodrome: 'SSCF' });
    const b = buildAviascanReadingsCacheKey({ aerodrome: 'SBSP' });

    expect(a).not.toBe(b);
  });
});
