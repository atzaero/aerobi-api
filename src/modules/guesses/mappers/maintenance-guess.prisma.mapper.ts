import { GuessStatus } from '@/generated/prisma/client';

const GUESS_STATUSES = ['pending', 'considered', 'dismissed'] as const;

export type ApiGuessStatus = (typeof GUESS_STATUSES)[number];

export function guessStatusToApi(status: GuessStatus): ApiGuessStatus {
  return status.toLowerCase() as ApiGuessStatus;
}

export function guessStatusFromApi(status: ApiGuessStatus): GuessStatus {
  return status.toUpperCase() as GuessStatus;
}

export { GUESS_STATUSES };
