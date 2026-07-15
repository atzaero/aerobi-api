import type { Prisma } from '@/generated/prisma/client';

import { UpdateCameraDTO } from '../dtos/update-camera.dto';

/**
 * Campos já resolvidos no service para criar uma câmera: o `icao` chega
 * **derivado do aeródromo** (não do cliente) e o `enabled` com o default
 * resolvido. `createdBy` é o ator autenticado.
 */
export interface CameraCreateFields {
  aerodromeId: string;
  icao: string;
  name: string;
  mediamtxNode: string;
  mediamtxPath: string;
  enabled: boolean;
  createdBy: string;
}

/** Monta o input de criação; o aeródromo é ligado via `connect`. */
export function buildCameraCreateInput(
  fields: CameraCreateFields,
): Prisma.CameraCreateInput {
  return {
    aerodrome: { connect: { id: fields.aerodromeId } },
    icao: fields.icao,
    name: fields.name,
    mediamtxNode: fields.mediamtxNode,
    mediamtxPath: fields.mediamtxPath,
    enabled: fields.enabled,
    createdBy: fields.createdBy,
  };
}

/**
 * Monta o patch da edição parcial (PATCH): campos `undefined` (ausentes no
 * payload) viram no-op no Prisma. O `aerodromeId`/`icao` não mudam pelo CRUD.
 * `updatedBy` é o ator.
 */
export function patchCameraToPrisma(
  dto: UpdateCameraDTO,
  updatedBy: string,
): Prisma.CameraUpdateInput {
  return {
    name: dto.name,
    mediamtxNode: dto.mediamtxNode,
    mediamtxPath: dto.mediamtxPath,
    enabled: dto.enabled,
    updatedBy,
  };
}
