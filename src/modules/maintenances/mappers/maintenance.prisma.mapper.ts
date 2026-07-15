import { generateSecurityCode } from '@/common/utils/security-code.util';
import type { Prisma } from '@/generated/prisma/client';

import { CreateMaintenanceDTO } from '../dtos/create-maintenance.dto';
import { UpdateMaintenanceDTO } from '../dtos/update-maintenance.dto';
import { normalizeAuthorizedEmails } from '../utils/normalize-authorized-emails';

export interface BuildMaintenanceCreateParams {
  dto: CreateMaintenanceDTO;
  actorId: string;
  aerodromeId: string;
}

export function buildMaintenanceCreateInput(
  params: BuildMaintenanceCreateParams,
): Prisma.MaintenanceCreateInput {
  const authorizedEmails = normalizeAuthorizedEmails(
    params.dto.authorizedEmails ?? [],
  );
  const securityCode =
    authorizedEmails.length > 0 ? generateSecurityCode() : null;

  return {
    name: params.dto.name.trim(),
    securityCode,
    authorizedEmails,
    aerodrome: { connect: { id: params.aerodromeId } },
    createdBy: params.actorId,
    updatedBy: params.actorId,
  };
}

export interface BuildMaintenanceUpdateParams {
  dto: UpdateMaintenanceDTO;
  actorId: string;
  currentSecurityCode: string | null;
  regenerateSecurityCode: boolean;
}

export function buildMaintenanceUpdateInput(
  params: BuildMaintenanceUpdateParams,
): Prisma.MaintenanceUpdateInput {
  const authorizedEmails = normalizeAuthorizedEmails(
    params.dto.authorizedEmails ?? [],
  );

  let securityCode: string | null;
  if (authorizedEmails.length === 0) {
    securityCode = null;
  } else if (
    params.regenerateSecurityCode ||
    !(params.currentSecurityCode?.trim().length ?? 0)
  ) {
    securityCode = generateSecurityCode();
  } else {
    securityCode = params.currentSecurityCode;
  }

  return {
    name: params.dto.name.trim(),
    authorizedEmails,
    securityCode,
    updatedBy: params.actorId,
  };
}
