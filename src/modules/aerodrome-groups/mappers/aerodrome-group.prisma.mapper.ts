import type { Prisma } from '@/generated/prisma/client';

import { CreateAerodromeGroupDTO } from '../dtos/create-aerodrome-group.dto';
import { UpdateAerodromeGroupDTO } from '../dtos/update-aerodrome-group.dto';

/**
 * Monta o input de criação. `createdBy` é o ator autenticado (auditoria com ator
 * real), nunca um valor vindo do corpo da requisição.
 */
export function buildAerodromeGroupCreateInput(
  dto: CreateAerodromeGroupDTO,
  createdBy: string,
): Prisma.AerodromeGroupCreateInput {
  return {
    uf: dto.uf,
    groupName: dto.groupName,
    ownerId: dto.ownerId,
    deletionRequested: dto.deletionRequested,
    createdBy,
  };
}

/**
 * Monta o patch de edição. Alinhado ao web: só `groupName` é editável;
 * `updatedBy` recebe o ator autenticado.
 */
export function patchAerodromeGroupToPrisma(
  dto: UpdateAerodromeGroupDTO,
  updatedBy: string,
): Prisma.AerodromeGroupUpdateInput {
  return {
    groupName: dto.groupName,
    updatedBy,
  };
}
