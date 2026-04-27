import { Injectable, Logger } from '@nestjs/common';

import type { Token } from '@/generated/prisma/client';
import type { TokenType } from '@/generated/prisma/enums';
import { PrismaService } from '@/prisma/prisma.service';

import type {
  CreateTokenData,
  ITokenRepository,
} from './token.repository.interface';

/**
 * Implementação Prisma-based de `ITokenRepository`.
 *
 * Regras de "ativo": `deletedAt: null`, `used: false`, `expiresAt > now()`.
 * Invalidação em lote usa `updateMany` marcando `used: true`, `deletedAt`,
 * `deletedBy` e `updatedBy` — soft-delete combinado com flag de consumo.
 */
@Injectable()
export class TokenRepository implements ITokenRepository {
  private readonly logger = new Logger(TokenRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTokenData): Promise<Token> {
    this.logger.debug(
      `Creating token type=${data.type} subjectId=${data.subjectId}`,
    );

    return this.prisma.token.create({
      data: {
        type: data.type,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
        subjectId: data.subjectId,
        ...(data.metadata !== undefined && {
          metadata: data.metadata as object,
        }),
        ...(data.createdBy !== undefined && { createdBy: data.createdBy }),
      },
    });
  }

  async findActiveBySubjectAndType(
    subjectId: string,
    type: TokenType,
  ): Promise<Token | null> {
    return this.prisma.token.findFirst({
      where: {
        subjectId,
        type,
        used: false,
        deletedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByHash(tokenHash: string): Promise<Token | null> {
    return this.prisma.token.findFirst({
      where: {
        tokenHash,
        used: false,
        deletedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  }

  async markAsUsed(id: string, updatedBy?: string): Promise<Token> {
    this.logger.debug(`Marking token as used id=${id}`);

    return this.prisma.token.update({
      where: { id },
      data: {
        used: true,
        ...(updatedBy !== undefined && { updatedBy }),
      },
    });
  }

  async invalidateBySubjectAndType(
    subjectId: string,
    type: TokenType,
    updatedBy?: string,
  ): Promise<void> {
    this.logger.debug(
      `Invalidating tokens subjectId=${subjectId} type=${type}`,
    );

    const now = new Date();

    await this.prisma.token.updateMany({
      where: {
        subjectId,
        type,
        used: false,
        deletedAt: null,
      },
      data: {
        used: true,
        deletedAt: now,
        ...(updatedBy !== undefined && {
          updatedBy,
          deletedBy: updatedBy,
        }),
      },
    });
  }
}
