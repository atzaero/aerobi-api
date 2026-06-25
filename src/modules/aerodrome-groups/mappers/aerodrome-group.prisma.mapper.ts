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
    name: dto.name,
    ownerId: dto.ownerId,
    deletionRequested: dto.deletionRequested,
    createdBy,
  };
}

/**
 * Monta o patch de edição. Alinhado ao web: só `name` é editável;
 * `updatedBy` recebe o ator autenticado.
 */
export function patchAerodromeGroupToPrisma(
  dto: UpdateAerodromeGroupDTO,
  updatedBy: string,
): Prisma.AerodromeGroupUpdateInput {
  return {
    name: dto.name,
    updatedBy,
  };
}
