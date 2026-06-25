import { Injectable, Logger } from '@nestjs/common';

import { isSerializationConflict } from '@/common/utils/prisma-error.util';
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

/** Tentativas totais ao colidir serialização (P2034) sob uploads concorrentes. */
const SERIALIZATION_MAX_ATTEMPTS = 3;
/** Backoff base entre tentativas (ms); cresce por tentativa, com jitter. */
const SERIALIZATION_BACKOFF_MS = 25;

@Injectable()
export class AerodromeGroupImageRepository implements IAerodromeGroupImageRepository {
  private readonly logger = new Logger(AerodromeGroupImageRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria a imagem ativa do grupo retentando a transação `Serializable` em caso
   * de conflito de serialização (P2034) — esperado sob uploads concorrentes ao
   * mesmo grupo. Como não há inconsistência de dados, o retry com backoff
   * resolve a colisão de forma transparente; só após esgotar as tentativas o
   * P2034 é propagado (o service o mapeia para 409).
   */
  async createActiveImage(
    input: CreateAerodromeGroupImageInput,
  ): Promise<void> {
    for (let attempt = 1; attempt <= SERIALIZATION_MAX_ATTEMPTS; attempt++) {
      try {
        await this.runCreateActiveImageTx(input);
        return;
      } catch (err) {
        if (
          isSerializationConflict(err) &&
          attempt < SERIALIZATION_MAX_ATTEMPTS
        ) {
          this.logger.warn(
            `Conflito de serialização no upload do grupo ${input.groupId} ` +
              `(tentativa ${attempt}/${SERIALIZATION_MAX_ATTEMPTS}); retentando.`,
          );
          await this.backoff(attempt);
          continue;
        }
        throw err;
      }
    }
  }

  private async runCreateActiveImageTx(
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

  /** Espera `attempt * base + jitter` ms entre retentativas de serialização. */
  private async backoff(attempt: number): Promise<void> {
    const jitter = Math.floor(Math.random() * SERIALIZATION_BACKOFF_MS);
    const delay = attempt * SERIALIZATION_BACKOFF_MS + jitter;
    await new Promise((resolve) => setTimeout(resolve, delay));
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
