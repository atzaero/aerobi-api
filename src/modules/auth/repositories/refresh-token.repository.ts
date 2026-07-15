import { Injectable, Logger } from '@nestjs/common';

import type { RefreshToken } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type {
  CreateRefreshTokenData,
  IRefreshTokenRepository,
} from './refresh-token.repository.interface';

/**
 * Implementação Prisma de `IRefreshTokenRepository`.
 *
 * Convenções:
 * - "ativo" = `deletedAt: null`, `revoked: false`, `expiresAt > now()`
 * - rotação é encapsulada em `$transaction` para evitar janela onde
 *   o antigo está revogado mas o novo ainda não existe
 * - reuse detection: o caller compara `findByJti(jti).revoked` antes de
 *   chamar `rotate`; se já estava revogado, dispara `revokeAllForUser`
 */
@Injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
  private readonly logger = new Logger(RefreshTokenRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateRefreshTokenData): Promise<RefreshToken> {
    this.logger.debug(
      `Creating refresh token jti=${data.jti} userId=${data.userId}`,
    );

    return this.prisma.refreshToken.create({
      data: {
        jti: data.jti,
        tokenHash: data.tokenHash,
        userId: data.userId,
        expiresAt: data.expiresAt,
        ...(data.userAgent !== undefined && { userAgent: data.userAgent }),
        ...(data.ipAddress !== undefined && { ipAddress: data.ipAddress }),
      },
    });
  }

  async findByJti(jti: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findUnique({ where: { jti } });
  }

  async rotate({
    currentId,
    newToken,
  }: {
    currentId: string;
    newToken: CreateRefreshTokenData;
  }): Promise<RefreshToken> {
    this.logger.debug(
      `Rotating refresh token currentId=${currentId} newJti=${newToken.jti}`,
    );

    return this.prisma.$transaction(async (tx) => {
      const created = await tx.refreshToken.create({
        data: {
          jti: newToken.jti,
          tokenHash: newToken.tokenHash,
          userId: newToken.userId,
          expiresAt: newToken.expiresAt,
          ...(newToken.userAgent !== undefined && {
            userAgent: newToken.userAgent,
          }),
          ...(newToken.ipAddress !== undefined && {
            ipAddress: newToken.ipAddress,
          }),
        },
      });

      await tx.refreshToken.update({
        where: { id: currentId },
        data: {
          revoked: true,
          revokedAt: new Date(),
          replacedById: created.id,
        },
      });

      return created;
    });
  }

  async revokeById(id: string): Promise<void> {
    this.logger.debug(`Revoking refresh token id=${id}`);

    await this.prisma.refreshToken.update({
      where: { id },
      data: { revoked: true, revokedAt: new Date() },
    });
  }

  async revokeAllForUser(userId: string): Promise<number> {
    this.logger.warn(`Revoking ALL refresh tokens for user userId=${userId}`);

    const now = new Date();
    const result = await this.prisma.refreshToken.updateMany({
      where: { userId, revoked: false, deletedAt: null },
      data: { revoked: true, revokedAt: now },
    });

    return result.count;
  }
}
