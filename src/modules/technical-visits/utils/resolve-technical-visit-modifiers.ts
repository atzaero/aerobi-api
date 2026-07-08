import { isUUID } from 'class-validator';

import type { UserRepository } from '@/modules/users/repositories/user.repository';

import { TechnicalVisitModifierResponseDTO } from '../dtos/technical-visit-modifier-response.dto';

export interface TechnicalVisitModifierUser {
  id: string;
  name: string | null;
  email: string;
}

/**
 * Projeta `modifierUsers` + `modifierAtTimes` em DTOs, usando um mapa de
 * usuários já carregado (evita N+1 na listagem).
 */
export function mapTechnicalVisitModifiers(
  modifierUserIds: readonly string[],
  modifierAtTimes: readonly Date[],
  usersById: ReadonlyMap<string, TechnicalVisitModifierUser>,
): TechnicalVisitModifierResponseDTO[] {
  return modifierUserIds.map((userId, index) => {
    const user = isUUID(userId) ? usersById.get(userId) : undefined;
    const at = modifierAtTimes[index];
    const row = new TechnicalVisitModifierResponseDTO();
    row.userId = user?.id ?? (isUUID(userId) ? userId : null);
    row.name = user?.name ?? user?.email ?? 'Usuário';
    row.email = user?.email ?? '';
    row.date = at ? at.toISOString() : null;
    return row;
  });
}

/** Coleta ids UUID únicos de `modifierUsers` em N visitas. */
export function collectTechnicalVisitModifierUserIds(
  entities: ReadonlyArray<{ modifierUsers: readonly string[] }>,
): string[] {
  const ids = new Set<string>();
  for (const entity of entities) {
    for (const userId of entity.modifierUsers) {
      if (userId && isUUID(userId)) ids.add(userId);
    }
  }
  return [...ids];
}

/**
 * Resolve `modifierUsers` (uids em ordem) para objetos ricos no response —
 * paridade `mapModifiers` do web.
 */
export async function resolveTechnicalVisitModifiers(
  userRepository: UserRepository,
  modifierUserIds: readonly string[],
  modifierAtTimes: readonly Date[] = [],
): Promise<TechnicalVisitModifierResponseDTO[]> {
  const ids = [
    ...new Set(
      modifierUserIds.filter((id): id is string => Boolean(id) && isUUID(id)),
    ),
  ];
  const users = ids.length > 0 ? await userRepository.findManyByIds(ids) : [];
  const byId = new Map(
    users.map((user) => [
      user.id,
      { id: user.id, name: user.name, email: user.email },
    ]),
  );
  return mapTechnicalVisitModifiers(modifierUserIds, modifierAtTimes, byId);
}
