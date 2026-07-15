import { clampListenRetryAttempts } from './clamp-listen-retry-attempts';
import {
  LISTEN_RETRY_DEFAULT_MAX,
  LISTEN_RETRY_MAX_ATTEMPTS_CAP,
} from './constants';

describe('clampListenRetryAttempts', () => {
  it('mantém um valor válido dentro do intervalo', () => {
    expect(clampListenRetryAttempts(5)).toBe(5);
  });

  it('trunca frações para baixo', () => {
    expect(clampListenRetryAttempts(5.9)).toBe(5);
  });

  it('cai no default para NaN, valores não-finitos ou < 1', () => {
    expect(clampListenRetryAttempts(Number.NaN)).toBe(LISTEN_RETRY_DEFAULT_MAX);
    expect(clampListenRetryAttempts(0)).toBe(LISTEN_RETRY_DEFAULT_MAX);
    expect(clampListenRetryAttempts(-3)).toBe(LISTEN_RETRY_DEFAULT_MAX);
    expect(clampListenRetryAttempts(Infinity)).toBe(LISTEN_RETRY_DEFAULT_MAX);
  });

  it('limita ao teto máximo', () => {
    expect(clampListenRetryAttempts(999)).toBe(LISTEN_RETRY_MAX_ATTEMPTS_CAP);
  });
});
