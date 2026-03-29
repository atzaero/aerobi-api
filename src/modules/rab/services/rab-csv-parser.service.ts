import { Injectable } from '@nestjs/common';
import { parse } from 'csv-parse/sync';

import type { RabCsvRow } from '../types/rab-csv-row.type';

@Injectable()
export class RabCsvParserService {
  /**
   * CSV ANAC: ISO-8859-1, `;`, primeira linha "Atualizado em:", header com "MARCAS".
   */
  parseBuffer(buffer: Buffer, period: string): RabCsvRow[] {
    const text = new TextDecoder('iso-8859-1').decode(buffer);
    const start = text.indexOf('"MARCAS"');
    if (start < 0) {
      throw new Error('CSV RAB: header MARCAS não encontrado');
    }
    const csvBody = text.slice(start);
    const records: Record<string, string>[] = parse(csvBody, {
      delimiter: ';',
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      relax_column_count: true,
      trim: true,
      bom: true,
    });

    const rows: RabCsvRow[] = [];
    for (const rec of records) {
      const g = (keys: string[]): string | null => {
        for (const k of keys) {
          const raw = rec[k];
          if (raw === undefined || raw === '') {
            continue;
          }
          const t = String(raw).trim();
          return t === '' ? null : t;
        }
        return null;
      };

      const marcas = g(['MARCAS', 'marcas']);
      if (!marcas) {
        continue;
      }

      rows.push({
        period,
        marcas,
        proprietarios: g(['PROPRIETARIOS', 'proprietarios']),
        operadores: g(['OPERADORES', 'operadores']),
        nrCertMatricula: g(['NR_CERT_MATRICULA', 'nr_cert_matricula']),
        nrSerie: g(['NR_SERIE', 'nr_serie']),
        cdTipo: g(['CD_TIPO', 'cd_tipo']),
        dsModelo: g(['DS_MODELO', 'ds_modelo']),
        nmFabricante: g(['NM_FABRICANTE', 'nm_fabricante']),
        cdCls: g(['CD_CLS', 'cd_cls']),
        nrPmd: g(['NR_PMD', 'nr_pmd']),
        cdTipoIcao: g(['CD_TIPO_ICAO', 'cd_tipo_icao']),
        nrTripulacaoMin: g(['NR_TRIPULACAO_MIN', 'nr_tripulacao_min']),
        nrPassageirosMax: g(['NR_PASSAGEIROS_MAX', 'nr_passageiros_max']),
        nrAssentos: g(['NR_ASSENTOS', 'nr_assentos']),
        nrAnoFabricacao: g(['NR_ANO_FABRICACAO', 'nr_ano_fabricacao']),
        dtValidadeCva: g(['DT_VALIDADE_CVA', 'dt_validade_cva']),
        dtValidadeCa: g(['DT_VALIDADE_CA', 'dt_validade_ca']),
        dtCanc: g(['DT_CANC', 'dt_canc']),
        dsMotivoCanc: g(['DS_MOTIVO_CANC', 'ds_motivo_canc']),
        cdInterdicao: g(['CD_INTERDICAO', 'cd_interdicao']),
        dsGravame: g(['DS_GRAVAME', 'ds_gravame']),
        dtMatricula: g(['DT_MATRICULA', 'dt_matricula']),
        tpMotor: g(['TP_MOTOR', 'tp_motor']),
        qtMotor: g(['QT_MOTOR', 'qt_motor']),
        tpPouso: g(['TP_POUSO', 'tp_pouso']),
        tpCa: g(['TP_CA', 'tp_ca']),
        cdPropositoCave: g(['CD_PROPOSITO_CAVE', 'cd_proposito_cave']),
        cfOperacional: g(['CF_OPERACIONAL', 'cf_operacional']),
        dsCategoriaHomologacao: g([
          'DS_CATEGORIA_HOMOLOGACAO',
          'ds_categoria_homologacao',
        ]),
        tpOperacao: g(['TP_OPERACAO', 'tp_operacao']),
      });
    }
    return rows;
  }
}
