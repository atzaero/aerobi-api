import { Injectable, Logger } from '@nestjs/common';

import { isSerializationConflict } from '@/common/utils/prisma-error.util';
import { Prisma, type Document } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type {
  AerodromeScopeRef,
  IDocumentRepository,
} from './document.repository.interface';

const activeWhere: Pick<Prisma.DocumentWhereInput, 'deletedAt'> = {
  deletedAt: null,
};

/**
 * Serializable garante a invariante "1 ativo por tipo" do upload dedicado: sob o
 * READ COMMITTED padrão, dois uploads concorrentes do mesmo aeródromo+tipo
 * poderiam ambos inserir antes de qualquer soft-delete (deixando 2 ativos) ou
 * soft-deletar o registro um do outro (deixando 0). Espelha
 * `GroupImageRepository`.
 */
const SERIALIZABLE = {
  isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
} as const;

/** Tentativas ao colidir serialização (P2034) sob uploads concorrentes. */
const SERIALIZATION_MAX_ATTEMPTS = 3;
/** Backoff base entre tentativas (ms); cresce por tentativa, com jitter. */
const SERIALIZATION_BACKOFF_MS = 25;

@Injectable()
export class DocumentRepository implements IDocumentRepository {
  private readonly logger = new Logger(DocumentRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.DocumentCreateInput): Promise<Document> {
    return this.prisma.document.create({ data });
  }

  update(id: string, data: Prisma.DocumentUpdateInput): Promise<Document> {
    return this.prisma.document.update({
      where: { id, ...activeWhere },
      data,
    });
  }

  findById(id: string): Promise<Document | null> {
    return this.prisma.document.findFirst({ where: { id, ...activeWhere } });
  }

  findMany(
    where: Prisma.DocumentWhereInput,
    skip: number,
    take: number,
  ): Promise<Document[]> {
    return this.prisma.document.findMany({
      where: { AND: [{ ...where }, activeWhere] },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  count(where: Prisma.DocumentWhereInput): Promise<number> {
    return this.prisma.document.count({
      where: { AND: [{ ...where }, activeWhere] },
    });
  }

  findAllForExport(
    where: Prisma.DocumentWhereInput,
    take: number,
  ): Promise<Document[]> {
    return this.prisma.document.findMany({
      where: { AND: [{ ...where }, activeWhere] },
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  softDelete(id: string, deletedBy: string): Promise<Document> {
    return this.prisma.document.update({
      where: { id, ...activeWhere },
      data: { deletedAt: new Date(), deletedBy, updatedBy: deletedBy },
    });
  }

  async createSupersedingActive(
    data: Prisma.DocumentCreateInput,
    aerodromeId: string,
    type: Document['type'],
    actorId: string,
  ): Promise<Document> {
    for (let attempt = 1; attempt <= SERIALIZATION_MAX_ATTEMPTS; attempt++) {
      try {
        return await this.runCreateSupersedingTx(
          data,
          aerodromeId,
          type,
          actorId,
        );
      } catch (err) {
        if (
          isSerializationConflict(err) &&
          attempt < SERIALIZATION_MAX_ATTEMPTS
        ) {
          this.logger.warn(
            `Conflito de serialização no upload do aeródromo ${aerodromeId} ` +
              `(tentativa ${attempt}/${SERIALIZATION_MAX_ATTEMPTS}); retentando.`,
          );
          await this.backoff(attempt);
          continue;
        }
        throw err;
      }
    }
    /** Inalcançável: cada tentativa retorna o documento ou relança o erro. */
    throw new Error(
      'createSupersedingActive: laço de retry encerrou sem resolução',
    );
  }

  private runCreateSupersedingTx(
    data: Prisma.DocumentCreateInput,
    aerodromeId: string,
    type: Document['type'],
    actorId: string,
  ): Promise<Document> {
    return this.prisma.$transaction(async (tx) => {
      const created = await tx.document.create({ data });

      await tx.document.updateMany({
        where: { aerodromeId, type, id: { not: created.id }, ...activeWhere },
        data: { deletedAt: new Date(), deletedBy: actorId, updatedBy: actorId },
      });

      return created;
    }, SERIALIZABLE);
  }

  /** Espera `attempt * base + jitter` ms entre retentativas de serialização. */
  private async backoff(attempt: number): Promise<void> {
    const jitter = Math.floor(Math.random() * SERIALIZATION_BACKOFF_MS);
    const delay = attempt * SERIALIZATION_BACKOFF_MS + jitter;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  async findAerodromeForScope(
    aerodromeId: string,
  ): Promise<AerodromeScopeRef | null> {
    const aerodrome = await this.prisma.aerodrome.findFirst({
      where: { id: aerodromeId, deletedAt: null },
      select: { groupId: true, group: { select: { uf: true } } },
    });
    return aerodrome
      ? { groupId: aerodrome.groupId, uf: aerodrome.group.uf }
      : null;
  }
}
