import {
  LISTEN_RETRY_DEFAULT_BASE_DELAY_MS,
  LISTEN_RETRY_MAX_DELAY_MS,
} from './constants';

export function clampListenRetryDelayMs(value: number): number {
  if (!Number.isFinite(value) || value < 50) {
    return LISTEN_RETRY_DEFAULT_BASE_DELAY_MS;
  }
  return Math.min(value, LISTEN_RETRY_MAX_DELAY_MS);
}
