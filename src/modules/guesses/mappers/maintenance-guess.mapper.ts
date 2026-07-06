import type { MaintenanceGuess } from '@/generated/prisma/client';

import {
  GuessListItemResponseDTO,
  PublicTaskGuessResponseDTO,
} from '../dtos/guess.dto';
import type { ListTaskGuessesQueryDTO } from '../dtos/list-task-guesses-query.dto';
import { guessStatusToApi } from './maintenance-guess.prisma.mapper';

function emailMatches(stored: string, filter: string): boolean {
  const needle = filter.trim().toLowerCase();
  if (!needle) return true;
  return stored.toLowerCase().includes(needle);
}

function textMatches(stored: string, filter: string): boolean {
  const needle = filter.trim().toLowerCase();
  if (!needle) return true;
  return stored.toLowerCase().includes(needle);
}

function guessDateKey(
  guess: Pick<GuessListItemResponseDTO, 'createdAt'>,
): string {
  return guess.createdAt.slice(0, 10);
}

function matchesDateRange(
  guess: Pick<GuessListItemResponseDTO, 'createdAt'>,
  startDate?: string,
  endDate?: string,
): boolean {
  const key = guessDateKey(guess);
  if (startDate && key < startDate) return false;
  if (endDate && key > endDate) return false;
  return true;
}

/**
 * Filtra palpites de uma tarefa (função pura). Substring em e-mail/texto;
 * status exato; intervalo de datas inclusivo (`yyyy-MM-dd`).
 */
export function filterTaskGuesses(
  guesses: readonly GuessListItemResponseDTO[],
  filters: ListTaskGuessesQueryDTO = {},
): GuessListItemResponseDTO[] {
  return guesses.filter((guess) => {
    if (filters.status && guess.status !== filters.status) return false;
    if (filters.email && !emailMatches(guess.email, filters.email))
      return false;
    if (filters.text && !textMatches(guess.text, filters.text)) return false;
    if (!matchesDateRange(guess, filters.startDate, filters.endDate)) {
      return false;
    }
    return true;
  });
}

export class MaintenanceGuessMapper {
  static toListItem(entity: MaintenanceGuess): GuessListItemResponseDTO {
    const row = new GuessListItemResponseDTO();
    row.id = entity.id;
    row.text = entity.text;
    row.email = entity.email;
    row.status = guessStatusToApi(entity.status);
    row.createdAt = entity.createdAt.toISOString();
    return row;
  }

  static toListItems(entities: MaintenanceGuess[]): GuessListItemResponseDTO[] {
    return entities.map((entity) => MaintenanceGuessMapper.toListItem(entity));
  }

  static toPublicTaskGuess(
    entity: MaintenanceGuess,
  ): PublicTaskGuessResponseDTO {
    const row = new PublicTaskGuessResponseDTO();
    row.text = entity.text;
    row.email = entity.email;
    row.status = guessStatusToApi(entity.status);
    row.createdAt = entity.createdAt.toISOString();
    return row;
  }

  static groupByTaskId(
    entities: MaintenanceGuess[],
  ): Record<string, PublicTaskGuessResponseDTO[]> {
    const result: Record<string, PublicTaskGuessResponseDTO[]> = {};
    for (const entity of entities) {
      const item = MaintenanceGuessMapper.toPublicTaskGuess(entity);
      if (!result[entity.taskId]) {
        result[entity.taskId] = [];
      }
      result[entity.taskId].push(item);
    }
    for (const taskId of Object.keys(result)) {
      result[taskId].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }
    return result;
  }
}
