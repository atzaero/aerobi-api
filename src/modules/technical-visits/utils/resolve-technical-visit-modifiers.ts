import { isUUID } from 'class-validator';

import type { UserRepository } from '@/modules/users/repositories/user.repository';

import { TechnicalVisitModifierResponseDTO } from '../dtos/technical-visit-modifier-response.dto';

export interface TechnicalVisitModifierUser {
  id: string;
  name: string | null;
  email: string;
}

/** Indexa por id os usuários carregados, para projetar modificadores sem N+1. */
export function buildTechnicalVisitModifierUserMap(
  users: ReadonlyArray<{ id: string; name: string | null; email: string }>,
): Map<string, TechnicalVisitModifierUser> {
  return new Map(
    users.map((user) => [
      user.id,
      { id: user.id, name: user.name, email: user.email },
    ]),
  );
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
    const isUuid = isUUID(userId);
    const user = isUuid ? usersById.get(userId) : undefined;
    const at = modifierAtTimes[index];
    const row = new TechnicalVisitModifierResponseDTO();
    row.userId = user?.id ?? (isUuid ? userId : null);
    /** Entrada legada não-UUID (e-mail no import): preserva a string bruta. */
    row.name = user?.name ?? user?.email ?? (isUuid ? 'Usuário' : userId);
    row.email = user?.email ?? (isUuid ? '' : userId);
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
  const byId = buildTechnicalVisitModifierUserMap(users);
  return mapTechnicalVisitModifiers(modifierUserIds, modifierAtTimes, byId);
}
