import { GuessStatus } from '@/generated/prisma/client';

import {
  GUESS_STATUSES,
  guessStatusFromApi,
  guessStatusToApi,
} from './maintenance-guess.prisma.mapper';

describe('maintenance-guess.prisma.mapper', () => {
  describe('guessStatusToApi', () => {
    it('converte enum UPPER para lowercase da API', () => {
      expect(guessStatusToApi(GuessStatus.PENDING)).toBe('pending');
      expect(guessStatusToApi(GuessStatus.CONSIDERED)).toBe('considered');
      expect(guessStatusToApi(GuessStatus.DISMISSED)).toBe('dismissed');
    });
  });

  describe('guessStatusFromApi', () => {
    it('converte lowercase da API para enum UPPER', () => {
      expect(guessStatusFromApi('pending')).toBe(GuessStatus.PENDING);
      expect(guessStatusFromApi('considered')).toBe(GuessStatus.CONSIDERED);
      expect(guessStatusFromApi('dismissed')).toBe(GuessStatus.DISMISSED);
    });
  });

  it('GUESS_STATUSES cobre exatamente os valores do enum GuessStatus', () => {
    const enumLower = Object.values(GuessStatus)
      .map((value) => value.toLowerCase())
      .sort();
    expect([...GUESS_STATUSES].sort()).toEqual(enumLower);
  });

  describe('ida-e-volta (round-trip)', () => {
    it('toApi ∘ fromApi é identidade para todo status da API', () => {
      for (const apiStatus of GUESS_STATUSES) {
        expect(guessStatusToApi(guessStatusFromApi(apiStatus))).toBe(apiStatus);
      }
    });

    it('fromApi ∘ toApi é identidade para todo valor do enum', () => {
      for (const enumStatus of Object.values(GuessStatus)) {
        expect(guessStatusFromApi(guessStatusToApi(enumStatus))).toBe(
          enumStatus,
        );
      }
    });
  });
});
