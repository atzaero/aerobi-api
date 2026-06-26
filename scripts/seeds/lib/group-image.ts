/**
 * Garante a bandeira de um grupo de estado, de forma idempotente e não
 * destrutiva. A fonte de verdade é a existência de uma `AerodromeGroupImage`
 * ativa: se já houver uma, faz skip (não re-sobe — evita acumular objetos órfãos
 * no MinIO a cada boot e respeita uma imagem trocada manualmente). Caso
 * contrário, sobe o PNG e registra a imagem desnormalizando `imageKey` no grupo,
 * espelhando o fluxo real do upload (sem o soft-delete de anteriores, pois só
 * executamos quando não há imagem ativa).
 */
import type { PrismaClient } from '@/generated/prisma/client';
import type { Uf } from '@/generated/prisma/enums';
import { buildAerodromeGroupImageKey } from '@/modules/aerodrome-groups/utils/aerodrome-group-image';

import type { SeedLogger } from '../types';
import { loadFlagFile } from './flags';
import type { SeedStorage } from './storage';

/** `skipped` quando já havia imagem ativa; `uploaded` quando subiu a bandeira. */
export type EnsureFlagResult = 'skipped' | 'uploaded';

/**
 * Garante que o grupo `groupId` (UF `uf`) tem a bandeira como imagem ativa.
 */
export async function ensureGroupFlag(
  prisma: PrismaClient,
  storage: SeedStorage,
  groupId: string,
  uf: Uf,
  logger: SeedLogger,
): Promise<EnsureFlagResult> {
  const activeImage = await prisma.aerodromeGroupImage.findFirst({
    where: { groupId, deletedAt: null },
    select: { id: true },
  });
  if (activeImage) {
    return 'skipped';
  }

  const flag = await loadFlagFile(uf);
  const key = buildAerodromeGroupImageKey(groupId, flag.mimetype);

  await storage.putObject(key, flag.buffer, flag.mimetype);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.aerodromeGroupImage.create({
        data: {
          groupId,
          imageKey: key,
          originalFilename: flag.filename,
          mimeType: flag.mimetype,
          sizeBytes: flag.sizeBytes,
          uploadedBy: 'seed',
        },
      });
      await tx.aerodromeGroup.update({
        where: { id: groupId },
        data: { imageKey: key, updatedBy: 'seed' },
      });
    });
  } catch (err) {
    /**
     * Compensação: o objeto já subiu mas o registro falhou — remove o órfão do
     * MinIO antes de propagar o erro.
     */
    await storage.deleteObject(key).catch(() => {
      logger.warn(
        `[seed:states] falha ao limpar objeto órfão ${key} após erro no registro da imagem.`,
      );
    });
    throw err;
  }

  return 'uploaded';
}
