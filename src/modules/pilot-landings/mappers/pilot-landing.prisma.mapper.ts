import type { Prisma } from '@/generated/prisma/client';

import { CreatePilotLandingDTO } from '../dtos/create-pilot-landing.dto';
import { UpdatePilotLandingDTO } from '../dtos/update-pilot-landing.dto';

/** DTO persistência Prisma para `PilotLandingCreateInput`. */
export function buildPilotLandingCreateInput(
  dto: CreatePilotLandingDTO,
): Prisma.PilotLandingCreateInput {
  const data: Prisma.PilotLandingCreateInput = {
    registration: dto.registration,
    localName: dto.localName,
    localIcao: dto.localIcao,
    checked: dto.checked,
    imagesPath: dto.imagesPath,
    landingAt: dto.landingAt,
    createdBy: dto.createdBy ?? undefined,
  };
  if (dto.aerodromeId) {
    data.aerodrome = {
      connect: { id: dto.aerodromeId },
    };
  }
  return data;
}

/** Campos PATCH → `PilotLandingUpdateInput`. */
export function patchPilotLandingToPrisma(
  dto: UpdatePilotLandingDTO,
): Prisma.PilotLandingUpdateInput {
  const data: Prisma.PilotLandingUpdateInput = {};

  if (dto.registration !== undefined) data.registration = dto.registration;
  if (dto.localName !== undefined) data.localName = dto.localName;
  if (dto.localIcao !== undefined) data.localIcao = dto.localIcao;
  if (dto.checked !== undefined) data.checked = dto.checked;
  if (dto.imagesPath !== undefined) data.imagesPath = dto.imagesPath;
  if (dto.landingAt !== undefined) data.landingAt = dto.landingAt;

  if (dto.disconnectAerodrome) {
    data.aerodrome = { disconnect: true };
  } else if (dto.aerodromeId !== undefined) {
    data.aerodrome = {
      connect: { id: dto.aerodromeId },
    };
  }

  return data;
}
