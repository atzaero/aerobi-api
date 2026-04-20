import { Injectable } from '@nestjs/common';

import { Prisma, type AerodromeGeojson } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type { IAerodromeGeojsonRepository } from './aerodrome-geojson.repository.interface';

@Injectable()
export class AerodromeGeojsonRepository implements IAerodromeGeojsonRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.AerodromeGeojsonCreateInput): Promise<AerodromeGeojson> {
    // TODO: implementar
    return this.prisma.aerodromeGeojson.create({ data });
  }

  update(
    id: string,
    data: Prisma.AerodromeGeojsonUpdateInput,
  ): Promise<AerodromeGeojson> {
    // TODO: implementar
    return this.prisma.aerodromeGeojson.update({ where: { id }, data });
  }

  findById(id: string): Promise<AerodromeGeojson | null> {
    // TODO: implementar (considerar filtrar deletedAt = null)
    return this.prisma.aerodromeGeojson.findUnique({ where: { id } });
  }

  findMany(
    where: Prisma.AerodromeGeojsonWhereInput,
    skip: number,
    take: number,
  ): Promise<AerodromeGeojson[]> {
    // TODO: implementar (considerar filtrar deletedAt = null e ordenar)
    return this.prisma.aerodromeGeojson.findMany({ where, skip, take });
  }

  count(where: Prisma.AerodromeGeojsonWhereInput): Promise<number> {
    // TODO: implementar
    return this.prisma.aerodromeGeojson.count({ where });
  }

  softDelete(id: string, deletedBy: string): Promise<AerodromeGeojson> {
    // TODO: implementar (conferir se updatedBy também precisa ser atualizado)
    return this.prisma.aerodromeGeojson.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });
  }
}
