import { isUUID } from 'class-validator';

import type { UserRepository } from '@/modules/users/repositories/user.repository';

import type { LandingRequestReviewer } from '../mappers/landing-request.mapper';

/**
 * Resolve os objetos dos revisores (`reviewedBy`) num mapa `id → reviewer`, para
 * o response de list/get. Filtra ids não-UUID (uid legado do Firebase, `public`)
 * antes da consulta — a coluna `users.id` é UUID e valores fora do formato
 * simplesmente não resolvem (ficam `null` no response), sem quebrar a query.
 */
export async function resolveReviewersById(
  userRepository: UserRepository,
  reviewedByIds: readonly (string | null)[],
): Promise<Map<string, LandingRequestReviewer>> {
  const ids = [
    ...new Set(
      reviewedByIds.filter((id): id is string => Boolean(id) && isUUID(id)),
    ),
  ];
  const users = await userRepository.findManyByIds(ids);
  return new Map(
    users.map((user) => [
      user.id,
      { id: user.id, name: user.name, email: user.email, role: user.role },
    ]),
  );
}
