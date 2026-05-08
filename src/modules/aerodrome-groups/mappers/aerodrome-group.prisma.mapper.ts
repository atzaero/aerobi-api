import type { Prisma } from '@/generated/prisma/client';

import { CreateAerodromeGroupDTO } from '../dtos/create-aerodrome-group.dto';
import { UpdateAerodromeGroupDTO } from '../dtos/update-aerodrome-group.dto';

export function buildAerodromeGroupCreateInput(
  dto: CreateAerodromeGroupDTO,
): Prisma.AerodromeGroupCreateInput {
  return {
    uf: dto.uf,
    groupName: dto.groupName,
    ownerId: dto.ownerId,
    deletionRequested: dto.deletionRequested,
    createdBy: dto.createdBy,
  };
}

export function patchAerodromeGroupToPrisma(
  dto: UpdateAerodromeGroupDTO,
): Prisma.AerodromeGroupUpdateInput {
  const data: Prisma.AerodromeGroupUpdateInput = {};
  if (dto.uf !== undefined) data.uf = dto.uf;
  if (dto.groupName !== undefined) data.groupName = dto.groupName;
  if (dto.ownerId !== undefined) data.ownerId = dto.ownerId;
  if (dto.deletionRequested !== undefined) {
    data.deletionRequested = dto.deletionRequested;
  }
  return data;
}
