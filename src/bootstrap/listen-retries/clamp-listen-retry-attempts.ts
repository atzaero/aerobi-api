import {
  LISTEN_RETRY_DEFAULT_MAX,
  LISTEN_RETRY_MAX_ATTEMPTS_CAP,
} from './constants';

export function clampListenRetryAttempts(value: number): number {
  if (!Number.isFinite(value) || value < 1) {
    return LISTEN_RETRY_DEFAULT_MAX;
  }
  return Math.min(Math.floor(value), LISTEN_RETRY_MAX_ATTEMPTS_CAP);
}
