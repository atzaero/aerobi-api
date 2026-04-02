import { Injectable } from '@nestjs/common';
import { Prisma } from '@/generated/prisma/client';
import { createId } from '@paralleldrive/cuid2';

import { PrismaService } from '@/prisma/prisma.service';

import type { PrivateAerodromesCsvRow } from '../types/private-aerodromes-csv-row.type';

const CHUNK_SIZE = 500;

const CONFLICT_UPDATE = Prisma.sql`
  ON CONFLICT ("ciad") DO UPDATE SET
    "codigo_oaci" = EXCLUDED."codigo_oaci",
    "nome" = EXCLUDED."nome",
    "municipio" = EXCLUDED."municipio",
    "uf" = EXCLUDED."uf",
    "longitude" = EXCLUDED."longitude",
    "latitude" = EXCLUDED."latitude",
    "altitude" = EXCLUDED."altitude",
    "operacao_diurna" = EXCLUDED."operacao_diurna",
    "operacao_noturna" = EXCLUDED."operacao_noturna",
    "designacao_1" = EXCLUDED."designacao_1",
    "comprimento_1" = EXCLUDED."comprimento_1",
    "largura_1" = EXCLUDED."largura_1",
    "resistencia_1" = EXCLUDED."resistencia_1",
    "superficie_1" = EXCLUDED."superficie_1",
    "designacao_2" = EXCLUDED."designacao_2",
    "comprimento_2" = EXCLUDED."comprimento_2",
    "largura_2" = EXCLUDED."largura_2",
    "resistencia_2" = EXCLUDED."resistencia_2",
    "superficie_2" = EXCLUDED."superficie_2",
    "portaria_registro" = EXCLUDED."portaria_registro",
    "link_portaria" = EXCLUDED."link_portaria",
    "lat_geo_point" = EXCLUDED."lat_geo_point",
    "lon_geo_point" = EXCLUDED."lon_geo_point"
`;

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

  async upsertBatch(rows: PrivateAerodromesCsvRow[]): Promise<void> {
    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
      const chunk = rows.slice(i, i + CHUNK_SIZE);
      const tuples = chunk.map((r) => this.rowToSqlTuple(r));
      await this.prisma.$executeRaw`
        INSERT INTO "private_aerodrome" (
          "id", "codigo_oaci", "ciad", "nome", "municipio", "uf",
          "longitude", "latitude", "altitude", "operacao_diurna",
          "operacao_noturna", "designacao_1", "comprimento_1", "largura_1",
          "resistencia_1", "superficie_1", "designacao_2", "comprimento_2",
          "largura_2", "resistencia_2", "superficie_2", "portaria_registro",
          "link_portaria", "lat_geo_point", "lon_geo_point"
        ) VALUES ${Prisma.join(tuples, ', ')}
        ${CONFLICT_UPDATE}
      `;
    }
  }
}
