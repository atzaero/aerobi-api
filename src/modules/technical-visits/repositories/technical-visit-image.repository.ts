import { Injectable } from '@nestjs/common';

import { Prisma, type TechnicalVisitImage } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

const activeWhere: Pick<Prisma.TechnicalVisitImageWhereInput, 'deletedAt'> = {
  deletedAt: null,
};

@Injectable()
export class TechnicalVisitImageRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    data: Prisma.TechnicalVisitImageCreateInput,
  ): Promise<TechnicalVisitImage> {
    return this.prisma.technicalVisitImage.create({ data });
  }

  findById(id: string): Promise<TechnicalVisitImage | null> {
    return this.prisma.technicalVisitImage.findFirst({
      where: { id, ...activeWhere },
    });
  }

  findByVisitId(technicalVisitId: string): Promise<TechnicalVisitImage[]> {
    return this.prisma.technicalVisitImage.findMany({
      where: { technicalVisitId, ...activeWhere },
      orderBy: { createdAt: 'asc' },
    });
  }

  softDelete(id: string, deletedBy: string): Promise<TechnicalVisitImage> {
    return this.prisma.technicalVisitImage.update({
      where: { id, ...activeWhere },
      data: {
        deletedAt: new Date(),
        deletedBy,
        updatedBy: deletedBy,
      },
    });
  }
}
