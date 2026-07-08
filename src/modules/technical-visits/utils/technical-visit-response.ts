import type { UserRepository } from '@/modules/users/repositories/user.repository';

import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import { TechnicalVisitMapper } from '../mappers/technical-visit.mapper';
import type { TechnicalVisitWithAerodrome } from '../types/technical-visit-with-aerodrome.type';
import {
  buildTechnicalVisitModifierUserMap,
  collectTechnicalVisitModifierUserIds,
  mapTechnicalVisitModifiers,
  resolveTechnicalVisitModifiers,
} from './resolve-technical-visit-modifiers';

export async function toTechnicalVisitApiRow(
  userRepository: UserRepository,
  entity: TechnicalVisitWithAerodrome,
): Promise<TechnicalVisitResponseDTO> {
  const modifiers = await resolveTechnicalVisitModifiers(
    userRepository,
    entity.modifierUsers,
    entity.modifierAtTimes,
  );
  return TechnicalVisitMapper.toApiRow(entity, modifiers);
}

export async function toTechnicalVisitApiRows(
  userRepository: UserRepository,
  entities: TechnicalVisitWithAerodrome[],
): Promise<TechnicalVisitResponseDTO[]> {
  if (entities.length === 0) return [];

  const ids = collectTechnicalVisitModifierUserIds(entities);
  const users = ids.length > 0 ? await userRepository.findManyByIds(ids) : [];
  const byId = buildTechnicalVisitModifierUserMap(users);

  return entities.map((entity) => {
    const modifiers = mapTechnicalVisitModifiers(
      entity.modifierUsers,
      entity.modifierAtTimes,
      byId,
    );
    return TechnicalVisitMapper.toApiRow(entity, modifiers);
  });
}
