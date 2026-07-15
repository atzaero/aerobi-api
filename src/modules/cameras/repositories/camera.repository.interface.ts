import type { Camera, Prisma } from '@/generated/prisma/client';

import type { CameraStreamSource } from '../types/camera-stream-source';

/**
 * Trio que identifica um stream único entre câmeras ativas. `exceptId` ignora a
 * própria câmera no check (usado no update).
 */
export interface StreamIdentity {
  icao: string;
  mediamtxNode: string;
  mediamtxPath: string;
  exceptId?: string;
}

export interface ICameraRepository {
  create(data: Prisma.CameraCreateInput): Promise<Camera>;

  update(id: string, data: Prisma.CameraUpdateInput): Promise<Camera>;

  findById(id: string): Promise<Camera | null>;

  findMany(
    where: Prisma.CameraWhereInput,
    skip: number,
    take: number,
  ): Promise<Camera[]>;

  count(where: Prisma.CameraWhereInput): Promise<number>;

  /** Soft delete: campos de auditoria `deletedAt`/`deletedBy` (+ `updatedBy`) e `enabled=false`. */
  softDelete(id: string, deletedBy: string): Promise<Camera>;

  /**
   * Aeródromo ativo (`id`, `groupId`, `icao`) para derivar o `icao` desnormalizado
   * e validar escopo/FK na escrita; `null` se inexistente/removido.
   */
  findActiveAerodrome(
    aerodromeId: string,
  ): Promise<{ id: string; groupId: string; icao: string } | null>;

  /** Câmera ativa com o mesmo trio de stream (ignorando `exceptId`), ou `null`. */
  findActiveStreamConflict(
    identity: StreamIdentity,
  ): Promise<{ id: string } | null>;

  /**
   * Projeção mínima de uma câmera ativa (`deletedAt IS NULL`) por id, para o
   * proxy HLS público (`camera-streams`). **Não** filtra `enabled` — o proxy
   * trata câmera desativada como 404 (permite cachear o negativo). `null` se
   * inexistente/removida.
   */
  findStreamSourceById(id: string): Promise<CameraStreamSource | null>;

  /**
   * Câmeras **publicáveis** de um aeródromo (por ICAO): ativas
   * (`deletedAt IS NULL`) e ligadas (`enabled = true`), ordenadas por `name`.
   */
  findEnabledStreamSourcesByIcao(icao: string): Promise<CameraStreamSource[]>;
}
