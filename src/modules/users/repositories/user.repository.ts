import { Injectable, Logger } from '@nestjs/common';

import { UserRole, type User } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type {
  CreateUserData,
  ExportUsersFilters,
  IUserRepository,
  ListUsersParams,
  ListUsersResult,
  UpdateUserData,
  UserWithGroupName,
} from './user.repository.interface';
import {
  buildUserCreateInput,
  buildUserSoftDeleteInput,
  buildUserUpdateInput,
  buildUserWhere,
} from './user-prisma.builder';

/**
 * Acesso a `User` via Prisma. A montagem dos inputs/where vive em
 * `user-prisma.builder.ts` (funções puras); aqui só persistimos/consultamos.
 */
@Injectable()
export class UserRepository implements IUserRepository {
  private readonly logger = new Logger(UserRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findActiveById(id: string): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { id, deletedAt: null } });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { email } });
    return count > 0;
  }

  async create(data: CreateUserData): Promise<User> {
    this.logger.debug(`Creating user email=${data.email} role=${data.role}`);

    return this.prisma.user.create({ data: buildUserCreateInput(data) });
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    this.logger.debug(`Updating user id=${id}`);

    return this.prisma.user.update({
      where: { id },
      data: buildUserUpdateInput(data),
    });
  }

  async softDelete(id: string, deletedBy?: string): Promise<User> {
    this.logger.debug(`Soft-deleting user id=${id} deletedBy=${deletedBy}`);

    return this.prisma.user.update({
      where: { id },
      data: buildUserSoftDeleteInput(new Date(), deletedBy),
    });
  }

  async findManyByIds(ids: string[]): Promise<User[]> {
    if (ids.length === 0) {
      return [];
    }
    return this.prisma.user.findMany({ where: { id: { in: ids } } });
  }

  async findGroupStaffEmails(groupId: string): Promise<string[]> {
    const staff = await this.prisma.user.findMany({
      where: {
        groupId,
        deletedAt: null,
        role: { in: [UserRole.COORDINATOR, UserRole.OPERATOR] },
      },
      select: { email: true },
    });
    const emails = staff
      .map((user) => user.email.trim())
      .filter((email) => email.length > 0);
    return [...new Set(emails)];
  }

  async findManyPaginated(params: ListUsersParams): Promise<ListUsersResult> {
    const where = buildUserWhere(params);

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { rows, total };
  }

  async findManyForExport(
    filters: ExportUsersFilters,
    take: number,
  ): Promise<UserWithGroupName[]> {
    return this.prisma.user.findMany({
      where: buildUserWhere(filters),
      orderBy: { createdAt: 'desc' },
      take,
      include: { group: { select: { name: true } } },
    });
  }

  async countForExport(filters: ExportUsersFilters): Promise<number> {
    return this.prisma.user.count({ where: buildUserWhere(filters) });
  }
}
