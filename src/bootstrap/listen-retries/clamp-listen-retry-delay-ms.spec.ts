import { clampListenRetryDelayMs } from './clamp-listen-retry-delay-ms';
import {
  LISTEN_RETRY_DEFAULT_BASE_DELAY_MS,
  LISTEN_RETRY_MAX_DELAY_MS,
} from './constants';

describe('clampListenRetryDelayMs', () => {
  it('mantém um valor válido dentro do intervalo', () => {
    expect(clampListenRetryDelayMs(250)).toBe(250);
  });

  it('cai no default para NaN, não-finitos ou < 50', () => {
    expect(clampListenRetryDelayMs(Number.NaN)).toBe(
      LISTEN_RETRY_DEFAULT_BASE_DELAY_MS,
    );
    expect(clampListenRetryDelayMs(10)).toBe(
      LISTEN_RETRY_DEFAULT_BASE_DELAY_MS,
    );
  });

  it('limita ao teto máximo', () => {
    expect(clampListenRetryDelayMs(999_999)).toBe(LISTEN_RETRY_MAX_DELAY_MS);
  });
});
