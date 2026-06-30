import type { Prisma } from '@/generated/prisma/client';

import type {
  CreateUserData,
  ExportUsersFilters,
  UpdateUserData,
} from './user.repository.interface';

/**
 * Builders puros DTO de domínio → input Prisma. Isolam a montagem condicional
 * (quais campos opcionais entram no payload) do acesso ao banco: o
 * `UserRepository` só persiste o resultado, e a regra de montagem ganha testes
 * unitários diretos, sem mock de Prisma. O Prisma fica encapsulado na camada de
 * dados (não vaza para os services).
 */

/** Input de criação: escalares obrigatórios + opcionais presentes. */
export function buildUserCreateInput(
  data: CreateUserData,
): Prisma.UserUncheckedCreateInput {
  return {
    email: data.email,
    name: data.name,
    role: data.role,
    ...(data.phone !== undefined && { phone: data.phone }),
    ...(data.groupId !== undefined && { groupId: data.groupId }),
    ...(data.state !== undefined && { state: data.state }),
    ...(data.invitedById !== undefined && { invitedById: data.invitedById }),
    ...(data.invitedAt !== undefined && { invitedAt: data.invitedAt }),
    ...(data.createdBy !== undefined && { createdBy: data.createdBy }),
  };
}

/** Update parcial: só os campos efetivamente enviados (preserva `null`). */
export function buildUserUpdateInput(
  data: UpdateUserData,
): Prisma.UserUpdateInput {
  const update: Prisma.UserUpdateInput = {};

  if (data.name !== undefined) update.name = data.name;
  if (data.email !== undefined) update.email = data.email;
  if (data.phone !== undefined) update.phone = data.phone;
  if (data.timezone !== undefined) update.timezone = data.timezone;
  if (data.role !== undefined) update.role = data.role;
  if (data.password !== undefined) update.password = data.password;
  if (data.emailVerified !== undefined) {
    update.emailVerified = data.emailVerified;
  }
  if (data.acceptedInviteAt !== undefined) {
    update.acceptedInviteAt = data.acceptedInviteAt;
  }
  if (data.lastLoginAt !== undefined) update.lastLoginAt = data.lastLoginAt;
  if (data.updatedBy !== undefined) update.updatedBy = data.updatedBy;

  return update;
}

/**
 * Input do soft-delete: `deletedAt` + (quando informado) `deletedBy`/`updatedBy`.
 * Recebe `deletedAt` por parâmetro para manter a função pura (o relógio fica no
 * repositório).
 */
export function buildUserSoftDeleteInput(
  deletedAt: Date,
  deletedBy?: string,
): Prisma.UserUpdateInput {
  return {
    deletedAt,
    ...(deletedBy !== undefined && { deletedBy, updatedBy: deletedBy }),
  };
}

/**
 * `where` compartilhado por listagem e export: sempre ativos (`deletedAt: null`),
 * `role`/`groupId` por igualdade e `search` em `email`/`name` (ILIKE — substring
 * case-insensitive). Função pura — testável sem Prisma.
 */
export function buildUserWhere(
  filters: ExportUsersFilters,
): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = { deletedAt: null };

  if (filters.role) {
    where.role = filters.role;
  }

  if (filters.groupId) {
    where.groupId = filters.groupId;
  }

  if (filters.search) {
    const term = filters.search.trim();
    if (term.length > 0) {
      where.OR = [
        { email: { contains: term, mode: 'insensitive' } },
        { name: { contains: term, mode: 'insensitive' } },
      ];
    }
  }

  return where;
}
