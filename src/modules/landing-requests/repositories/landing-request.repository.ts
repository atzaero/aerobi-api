import { Injectable } from '@nestjs/common';

import { Prisma, type LandingRequest } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type { ILandingRequestRepository } from './landing-request.repository.interface';

@Injectable()
export class LandingRequestRepository implements ILandingRequestRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.LandingRequestCreateInput): Promise<LandingRequest> {
    // TODO: implementar
    return this.prisma.landingRequest.create({ data });
  }

  update(
    id: string,
    data: Prisma.LandingRequestUpdateInput,
  ): Promise<LandingRequest> {
    // TODO: implementar
    return this.prisma.landingRequest.update({ where: { id }, data });
  }

  findById(id: string): Promise<LandingRequest | null> {
    // TODO: implementar (considerar filtrar deletedAt = null)
    return this.prisma.landingRequest.findUnique({ where: { id } });
  }

  findMany(
    where: Prisma.LandingRequestWhereInput,
    skip: number,
    take: number,
  ): Promise<LandingRequest[]> {
    // TODO: implementar (considerar filtrar deletedAt = null e ordenar)
    return this.prisma.landingRequest.findMany({ where, skip, take });
  }

  count(where: Prisma.LandingRequestWhereInput): Promise<number> {
    // TODO: implementar
    return this.prisma.landingRequest.count({ where });
  }

  softDelete(id: string, deletedBy: string): Promise<LandingRequest> {
    // TODO: implementar (conferir se updatedBy também precisa ser atualizado)
    return this.prisma.landingRequest.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });
  }
}
