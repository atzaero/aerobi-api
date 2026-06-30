import type { Prisma } from '@/generated/prisma/client';

import { CreateGroupDTO } from '../dtos/create-group.dto';
import { UpdateGroupDTO } from '../dtos/update-group.dto';

/**
 * Monta o input de criação. `createdBy` é o ator autenticado (auditoria com ator
 * real), nunca um valor vindo do corpo da requisição.
 */
export function buildGroupCreateInput(
  dto: CreateGroupDTO,
  createdBy: string,
): Prisma.GroupCreateInput {
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
export function patchGroupToPrisma(
  dto: UpdateGroupDTO,
  updatedBy: string,
): Prisma.GroupUpdateInput {
  return {
    name: dto.name,
    updatedBy,
  };
}
