import { Injectable } from '@nestjs/common';
import { Prisma } from '@/generated/prisma/client';
import { createId } from '@paralleldrive/cuid2';

import { PrismaService } from '@/prisma/prisma.service';

import type { PrivateAerodromesCsvRow } from '../types/private-aerodromes-csv-row.type';
import {
  PRIVATE_AERODROME_CHUNK_SIZE,
  PRIVATE_AERODROME_CONFLICT_UPDATE,
  PRIVATE_AERODROME_INSERT_COLUMNS,
} from './private-aerodrome.sql';

@Injectable()
export class PrivateAerodromeRepository {
  constructor(private readonly prisma: PrismaService) {}

  private rowToSqlTuple(r: PrivateAerodromesCsvRow): Prisma.Sql {
    return Prisma.sql`(
      ${createId()},
      ${r.codigoOaci},
      ${r.ciad},
      ${r.nome},
      ${r.municipio},
      ${r.uf},
      ${r.longitude},
      ${r.latitude},
      ${r.altitude},
      ${r.operacaoDiurna},
      ${r.operacaoNoturna},
      ${r.designacao1},
      ${r.comprimento1},
      ${r.largura1},
      ${r.resistencia1},
      ${r.superficie1},
      ${r.designacao2},
      ${r.comprimento2},
      ${r.largura2},
      ${r.resistencia2},
      ${r.superficie2},
      ${r.portariaRegistro},
      ${r.linkPortaria},
      ${r.latGeoPoint},
      ${r.lonGeoPoint}
    )`;
  }

  findMany(
    where: Prisma.PrivateAerodromeWhereInput,
    skip: number,
    take: number,
  ) {
    return this.prisma.privateAerodrome.findMany({
      where,
      skip,
      take,
      orderBy: { ciad: 'asc' },
    });
  }

  count(where: Prisma.PrivateAerodromeWhereInput) {
    return this.prisma.privateAerodrome.count({ where });
  }

  async upsertBatch(rows: PrivateAerodromesCsvRow[]): Promise<void> {
    for (let i = 0; i < rows.length; i += PRIVATE_AERODROME_CHUNK_SIZE) {
      const chunk = rows.slice(i, i + PRIVATE_AERODROME_CHUNK_SIZE);
      const tuples = chunk.map((r) => this.rowToSqlTuple(r));
      await this.prisma.$executeRaw`
        INSERT INTO "private_aerodrome" ${PRIVATE_AERODROME_INSERT_COLUMNS}
        VALUES ${Prisma.join(tuples, ', ')}
        ${PRIVATE_AERODROME_CONFLICT_UPDATE}
      `;
    }
  }
}
