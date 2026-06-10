import { Injectable } from '@nestjs/common';
import { Prisma, type RabRow } from '@/generated/prisma/client';
import { createId } from '@paralleldrive/cuid2';

import { PrismaService } from '@/prisma/prisma.service';

import type { IRabRowRepository } from '../contracts/rab-row-repository.interface';
import type { RabCsvRow } from '../types/rab-csv-row.type';

const CHUNK_SIZE = 500;

const CONFLICT_UPDATE = Prisma.sql`
  ON CONFLICT ("period", "marcas") DO UPDATE SET
    "proprietarios" = EXCLUDED."proprietarios",
    "operadores" = EXCLUDED."operadores",
    "nr_cert_matricula" = EXCLUDED."nr_cert_matricula",
    "nr_serie" = EXCLUDED."nr_serie",
    "cd_tipo" = EXCLUDED."cd_tipo",
    "ds_modelo" = EXCLUDED."ds_modelo",
    "nm_fabricante" = EXCLUDED."nm_fabricante",
    "cd_cls" = EXCLUDED."cd_cls",
    "nr_pmd" = EXCLUDED."nr_pmd",
    "cd_tipo_icao" = EXCLUDED."cd_tipo_icao",
    "nr_tripulacao_min" = EXCLUDED."nr_tripulacao_min",
    "nr_passageiros_max" = EXCLUDED."nr_passageiros_max",
    "nr_assentos" = EXCLUDED."nr_assentos",
    "nr_ano_fabricacao" = EXCLUDED."nr_ano_fabricacao",
    "dt_validade_cva" = EXCLUDED."dt_validade_cva",
    "dt_validade_ca" = EXCLUDED."dt_validade_ca",
    "dt_canc" = EXCLUDED."dt_canc",
    "ds_motivo_canc" = EXCLUDED."ds_motivo_canc",
    "cd_interdicao" = EXCLUDED."cd_interdicao",
    "ds_gravame" = EXCLUDED."ds_gravame",
    "dt_matricula" = EXCLUDED."dt_matricula",
    "tp_motor" = EXCLUDED."tp_motor",
    "qt_motor" = EXCLUDED."qt_motor",
    "tp_pouso" = EXCLUDED."tp_pouso",
    "tp_ca" = EXCLUDED."tp_ca",
    "cd_proposito_cave" = EXCLUDED."cd_proposito_cave",
    "cf_operacional" = EXCLUDED."cf_operacional",
    "ds_categoria_homologacao" = EXCLUDED."ds_categoria_homologacao",
    "tp_operacao" = EXCLUDED."tp_operacao"
`;

@Injectable()
export class RabRowRepository implements IRabRowRepository {
  constructor(private readonly prisma: PrismaService) {}

  private rowToSqlTuple(r: RabCsvRow): Prisma.Sql {
    return Prisma.sql`(
      ${createId()},
      ${r.period},
      ${r.marcas},
      ${r.proprietarios},
      ${r.operadores},
      ${r.nrCertMatricula},
      ${r.nrSerie},
      ${r.cdTipo},
      ${r.dsModelo},
      ${r.nmFabricante},
      ${r.cdCls},
      ${r.nrPmd},
      ${r.cdTipoIcao},
      ${r.nrTripulacaoMin},
      ${r.nrPassageirosMax},
      ${r.nrAssentos},
      ${r.nrAnoFabricacao},
      ${r.dtValidadeCva},
      ${r.dtValidadeCa},
      ${r.dtCanc},
      ${r.dsMotivoCanc},
      ${r.cdInterdicao},
      ${r.dsGravame},
      ${r.dtMatricula},
      ${r.tpMotor},
      ${r.qtMotor},
      ${r.tpPouso},
      ${r.tpCa},
      ${r.cdPropositoCave},
      ${r.cfOperacional},
      ${r.dsCategoriaHomologacao},
      ${r.tpOperacao}
    )`;
  }

  async upsertBatch(rows: RabCsvRow[]): Promise<void> {
    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
      const chunk = rows.slice(i, i + CHUNK_SIZE);
      const tuples = chunk.map((r) => this.rowToSqlTuple(r));
      await this.prisma.$executeRaw`
        INSERT INTO "rab_row" (
          "id", "period", "marcas", "proprietarios", "operadores",
          "nr_cert_matricula", "nr_serie", "cd_tipo", "ds_modelo", "nm_fabricante",
          "cd_cls", "nr_pmd", "cd_tipo_icao", "nr_tripulacao_min", "nr_passageiros_max",
          "nr_assentos", "nr_ano_fabricacao", "dt_validade_cva", "dt_validade_ca", "dt_canc",
          "ds_motivo_canc", "cd_interdicao", "ds_gravame", "dt_matricula", "tp_motor",
          "qt_motor", "tp_pouso", "tp_ca", "cd_proposito_cave", "cf_operacional",
          "ds_categoria_homologacao", "tp_operacao"
        ) VALUES ${Prisma.join(tuples, ', ')}
        ${CONFLICT_UPDATE}
      `;
    }
  }

  /**
   * Retorna a `rab_row` mais recente (maior `period`) para uma matrícula. Usado
   * pelo snapshot de aeronave no momento da criação do movimento.
   *
   * O match é case-insensitive exato entre `marcas` (matrícula). Hoje assume-se
   * que `registration` (ex.: "PR-ZTT") e `marcas` da ANAC compartilham o mesmo
   * formato (hífen/caixa). Se os formatos divergirem no futuro (ex.: ANAC sem
   * hífen), a normalização precisará de refinamento aqui; por ora o no-match é
   * tratado graciosamente (retorna `null`) e o movimento não falha.
   */
  findLatestByMarcas(marcas: string): Promise<RabRow | null> {
    return this.prisma.rabRow.findFirst({
      where: { marcas: { equals: marcas, mode: 'insensitive' } },
      orderBy: { period: 'desc' },
    });
  }

  findMany(where: Prisma.RabRowWhereInput, skip: number, take: number) {
    return this.prisma.rabRow.findMany({
      where,
      skip,
      take,
      orderBy: { marcas: 'asc' },
    });
  }

  count(where: Prisma.RabRowWhereInput) {
    return this.prisma.rabRow.count({ where });
  }
}
