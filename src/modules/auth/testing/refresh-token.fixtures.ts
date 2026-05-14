import type { RefreshToken } from '@/generated/prisma/client';

/**
 * Fixture central de `RefreshToken` para specs do módulo `auth/`.
 *
 * @example
 * ```ts
 * buildRefreshTokenFixture({ revoked: true, tokenHash: REFRESH_HASH })
 * ```
 */
const REFERENCE_DATE = new Date('2026-05-14T00:00:00.000Z');

export function buildRefreshTokenFixture(
  overrides: Partial<RefreshToken> = {},
): RefreshToken {
  return {
    id: 'rt-1',
    jti: 'jti-1',
    tokenHash: 'token-hash-placeholder',
    userId: 'user-1',
    expiresAt: new Date(Date.now() + 60 * 60_000),
    revoked: false,
    revokedAt: null,
    replacedById: null,
    userAgent: null,
    ipAddress: null,
    deletedAt: null,
    deletedBy: null,
    createdAt: REFERENCE_DATE,
    createdBy: null,
    updatedAt: REFERENCE_DATE,
    updatedBy: null,
    ...overrides,
  };
}
