import { Injectable } from '@nestjs/common';

import { Prisma } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type {
  CreateAerodromeGroupImageInput,
  IAerodromeGroupImageRepository,
} from './aerodrome-group-image.repository.interface';

/**
 * Serializable garante a invariante "1 imagem ativa por grupo": sob o
 * READ COMMITTED padrão, dois uploads concorrentes poderiam ambos inserir antes
 * de qualquer `updateMany`, deixando duas ativas (ou zero). Serializa o par
 * create+soft-delete por grupo.
 */
const SERIALIZABLE = {
  isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
} as const;

@Injectable()
export class AerodromeGroupImageRepository implements IAerodromeGroupImageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createActiveImage(
    input: CreateAerodromeGroupImageInput,
  ): Promise<void> {
    const {
      groupId,
      imageKey,
      originalFilename,
      mimeType,
      sizeBytes,
      actorId,
    } = input;

    await this.prisma.$transaction(async (tx) => {
      const created = await tx.aerodromeGroupImage.create({
        data: {
          groupId,
          imageKey,
          originalFilename,
          mimeType,
          sizeBytes,
          uploadedBy: actorId,
        },
        select: { id: true },
      });

      await tx.aerodromeGroupImage.updateMany({
        where: { groupId, deletedAt: null, id: { not: created.id } },
        data: { deletedAt: new Date(), deletedBy: actorId, updatedBy: actorId },
      });

      await tx.aerodromeGroup.update({
        where: { id: groupId, deletedAt: null },
        data: { imageKey, updatedBy: actorId },
      });
    }, SERIALIZABLE);
  }

  async removeActiveImage(groupId: string, actorId: string): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const active = await tx.aerodromeGroupImage.findFirst({
        where: { groupId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      });

      if (!active) {
        return false;
      }

      await tx.aerodromeGroupImage.update({
        where: { id: active.id },
        data: { deletedAt: new Date(), deletedBy: actorId, updatedBy: actorId },
      });

      const next = await tx.aerodromeGroupImage.findFirst({
        where: { groupId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        select: { imageKey: true },
      });

      await tx.aerodromeGroup.update({
        where: { id: groupId, deletedAt: null },
        data: { imageKey: next?.imageKey ?? null, updatedBy: actorId },
      });

      return true;
    }, SERIALIZABLE);
  }
}
