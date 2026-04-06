import { Injectable } from '@nestjs/common';
import { Prisma } from '@/generated/prisma/client';
import { createId } from '@paralleldrive/cuid2';

import { PrismaService } from '@/prisma/prisma.service';

import type { PublicAerodromesCsvRow } from '../types/public-aerodromes-csv-row.type';
import {
  PUBLIC_AERODROME_CHUNK_SIZE,
  PUBLIC_AERODROME_CONFLICT_UPDATE,
  PUBLIC_AERODROME_INSERT_COLUMNS,
} from './public-aerodrome.sql';

@Injectable()
export class PublicAerodromeRepository {
  constructor(private readonly prisma: PrismaService) {}

  private rowToSqlTuple(r: PublicAerodromesCsvRow): Prisma.Sql {
    return Prisma.sql`(
      ${createId()},
      ${r.codigoOaci},
      ${r.ciad},
      ${r.nome},
      ${r.municipio},
      ${r.uf},
      ${r.municipioServido},
      ${r.ufServido},
      ${r.latitude},
      ${r.longitude},
      ${r.altitude},
      ${r.operacaoDiurna},
      ${r.operacaoNoturna},
      ${r.situacao},
      ${r.validadeRegistro},
      ${r.portariaRegistro},
      ${r.linkPortaria},
      ${r.latGeoPoint},
      ${r.lonGeoPoint}
    )`;
  }

  findMany(
    where: Prisma.PublicAerodromeWhereInput,
    skip: number,
    take: number,
  ) {
    return this.prisma.publicAerodrome.findMany({
      where,
      skip,
      take,
      orderBy: { ciad: 'asc' },
    });
  }

  count(where: Prisma.PublicAerodromeWhereInput) {
    return this.prisma.publicAerodrome.count({ where });
  }

  async upsertBatch(rows: PublicAerodromesCsvRow[]): Promise<void> {
    for (let i = 0; i < rows.length; i += PUBLIC_AERODROME_CHUNK_SIZE) {
      const chunk = rows.slice(i, i + PUBLIC_AERODROME_CHUNK_SIZE);
      const tuples = chunk.map((r) => this.rowToSqlTuple(r));
      await this.prisma.$executeRaw`
        INSERT INTO "public_aerodrome" ${PUBLIC_AERODROME_INSERT_COLUMNS}
        VALUES ${Prisma.join(tuples, ', ')}
        ${PUBLIC_AERODROME_CONFLICT_UPDATE}
      `;
    }
  }
}
