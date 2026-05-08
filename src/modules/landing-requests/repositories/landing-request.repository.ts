import { Injectable } from '@nestjs/common';

import { Prisma, type LandingRequest } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type { ILandingRequestRepository } from './landing-request.repository.interface';

const activeWhere: Pick<Prisma.LandingRequestWhereInput, 'deletedAt'> = {
  deletedAt: null,
};

@Injectable()
export class LandingRequestRepository implements ILandingRequestRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.LandingRequestCreateInput): Promise<LandingRequest> {
    return this.prisma.landingRequest.create({ data });
  }

  update(
    id: string,
    data: Prisma.LandingRequestUpdateInput,
  ): Promise<LandingRequest> {
    return this.prisma.landingRequest.update({
      where: { id, ...activeWhere },
      data,
    });
  }

  findById(id: string): Promise<LandingRequest | null> {
    return this.prisma.landingRequest.findFirst({
      where: { id, ...activeWhere },
    });
  }

  findMany(
    where: Prisma.LandingRequestWhereInput,
    skip: number,
    take: number,
  ): Promise<LandingRequest[]> {
    return this.prisma.landingRequest.findMany({
      where: {
        AND: [{ ...where }, activeWhere],
      },
      skip,
      take,
      orderBy: { requestDate: 'desc' },
    });
  }

  count(where: Prisma.LandingRequestWhereInput): Promise<number> {
    return this.prisma.landingRequest.count({
      where: {
        AND: [{ ...where }, activeWhere],
      },
    });
  }

  softDelete(id: string, deletedBy: string): Promise<LandingRequest> {
    return this.prisma.landingRequest.update({
      where: { id, ...activeWhere },
      data: {
        deletedAt: new Date(),
        deletedBy,
        updatedBy: deletedBy,
      },
    });
  }
}
