/** Dev (watcher/HMR): tentativas até a porta ficar livre. */
export const LISTEN_RETRY_DEFAULT_MAX = 10;

export const LISTEN_RETRY_DEFAULT_BASE_DELAY_MS = 400;

/** Teto de backoff por tentativa. */
export const LISTEN_RETRY_MAX_DELAY_MS = 3500;

/** Evita valores absurdos vindos do ambiente (ex.: typo). */
export const LISTEN_RETRY_MAX_ATTEMPTS_CAP = 30;
