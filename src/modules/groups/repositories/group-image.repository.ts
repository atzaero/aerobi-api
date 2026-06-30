import { Injectable, Logger } from '@nestjs/common';

import { isSerializationConflict } from '@/common/utils/prisma-error.util';
import { Group, Prisma } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type {
  CreateGroupImageInput,
  IGroupImageRepository,
} from './group-image.repository.interface';

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
export class GroupImageRepository implements IGroupImageRepository {
  private readonly logger = new Logger(GroupImageRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria a imagem ativa do grupo retentando a transação `Serializable` em caso
   * de conflito de serialização (P2034) — esperado sob uploads concorrentes ao
   * mesmo grupo. Como não há inconsistência de dados, o retry com backoff
   * resolve a colisão de forma transparente; só após esgotar as tentativas o
   * P2034 é propagado (o service o mapeia para 409). Retorna o grupo já
   * atualizado (com `imageKey` sincronizado), evitando um re-fetch pós-tx.
   */
  async createActiveImage(input: CreateGroupImageInput): Promise<Group> {
    for (let attempt = 1; attempt <= SERIALIZATION_MAX_ATTEMPTS; attempt++) {
      try {
        return await this.runCreateActiveImageTx(input);
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
    /**
     * Inalcançável: cada tentativa ou retorna o grupo, ou relança o erro (o
     * retry exige `attempt < SERIALIZATION_MAX_ATTEMPTS`). O `throw` existe só
     * para satisfazer o tipo de retorno não-`void`.
     */
    throw new Error('createActiveImage: laço de retry encerrou sem resolução');
  }

  private async runCreateActiveImageTx(
    input: CreateGroupImageInput,
  ): Promise<Group> {
    const {
      groupId,
      imageKey,
      originalFilename,
      mimeType,
      sizeBytes,
      actorId,
    } = input;

    return this.prisma.$transaction(async (tx) => {
      const created = await tx.groupImage.create({
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

      await tx.groupImage.updateMany({
        where: { groupId, deletedAt: null, id: { not: created.id } },
        data: { deletedAt: new Date(), deletedBy: actorId, updatedBy: actorId },
      });

      return tx.group.update({
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

  async removeActiveImage(
    groupId: string,
    actorId: string,
  ): Promise<Group | null> {
    return this.prisma.$transaction(async (tx) => {
      const active = await tx.groupImage.findFirst({
        where: { groupId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      });

      if (!active) {
        return null;
      }

      await tx.groupImage.update({
        where: { id: active.id },
        data: { deletedAt: new Date(), deletedBy: actorId, updatedBy: actorId },
      });

      const next = await tx.groupImage.findFirst({
        where: { groupId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        select: { imageKey: true },
      });

      return tx.group.update({
        where: { id: groupId, deletedAt: null },
        data: { imageKey: next?.imageKey ?? null, updatedBy: actorId },
      });
    }, SERIALIZABLE);
  }
}
