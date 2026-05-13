import { Injectable, Logger } from '@nestjs/common';

import type { Prisma, User } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type {
  CreateUserData,
  IUserRepository,
  ListUsersParams,
  ListUsersResult,
  UpdateUserData,
} from './user.repository.interface';

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

    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: data.role,
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.invitedById !== undefined && {
          invitedById: data.invitedById,
        }),
        ...(data.invitedAt !== undefined && { invitedAt: data.invitedAt }),
        ...(data.createdBy !== undefined && { createdBy: data.createdBy }),
      },
    });
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    this.logger.debug(`Updating user id=${id}`);

    const update: Prisma.UserUpdateInput = {};

    if (data.name !== undefined) update.name = data.name;
    if (data.phone !== undefined) update.phone = data.phone;
    if (data.timezone !== undefined) update.timezone = data.timezone;
    if (data.role !== undefined) update.role = data.role;
    if (data.password !== undefined) update.password = data.password;
    if (data.emailVerified !== undefined)
      update.emailVerified = data.emailVerified;
    if (data.acceptedInviteAt !== undefined)
      update.acceptedInviteAt = data.acceptedInviteAt;
    if (data.lastLoginAt !== undefined) update.lastLoginAt = data.lastLoginAt;
    if (data.updatedBy !== undefined) update.updatedBy = data.updatedBy;

    return this.prisma.user.update({ where: { id }, data: update });
  }

  async softDelete(id: string, deletedBy?: string): Promise<User> {
    this.logger.debug(`Soft-deleting user id=${id} deletedBy=${deletedBy}`);

    return this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        ...(deletedBy !== undefined && { deletedBy, updatedBy: deletedBy }),
      },
    });
  }

  async findManyPaginated(params: ListUsersParams): Promise<ListUsersResult> {
    const where: Prisma.UserWhereInput = { deletedAt: null };

    if (params.role) {
      where.role = params.role;
    }

    if (params.search) {
      const term = params.search.trim();
      if (term.length > 0) {
        where.OR = [
          { email: { contains: term, mode: 'insensitive' } },
          { name: { contains: term, mode: 'insensitive' } },
        ];
      }
    }

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
}
