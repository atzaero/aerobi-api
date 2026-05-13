import type { User } from '@/generated/prisma/client';

import type { UserResponseDto } from '../dtos/user-response.dto';

/**
 * Projeta um `User` do domínio em `UserResponseDto`. **Nunca** expõe
 * `password` (mesmo hash) — a interface de saída não tem esse campo.
 *
 * Datas viram ISO 8601 strings; nulos são preservados explicitamente.
 */
export function toUserResponse(user: User): UserResponseDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone ?? null,
    role: user.role,
    emailVerified: user.emailVerified,
    timezone: user.timezone ?? null,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    invitedById: user.invitedById ?? null,
    invitedAt: user.invitedAt?.toISOString() ?? null,
    acceptedInviteAt: user.acceptedInviteAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
