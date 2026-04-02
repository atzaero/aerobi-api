import { Injectable, Logger } from '@nestjs/common';
import { parse } from 'csv-parse/sync';

import type { PrivateAerodromesCsvRow } from '../types/private-aerodromes-csv-row.type';
import { resolvePrivateAerodromesCsvTextDecoderLabel } from '../utils/private-aerodromes-csv-encoding';

export type ParsePrivateAerodromesCsvBufferOptions = {
  contentType?: string;
};

@Injectable()
export class PrivateAerodromesCsvParserService {
  private readonly logger = new Logger(PrivateAerodromesCsvParserService.name);

  parseBuffer(
    buffer: Buffer,
    options?: ParsePrivateAerodromesCsvBufferOptions,
  ): PrivateAerodromesCsvRow[] {
    const label = resolvePrivateAerodromesCsvTextDecoderLabel(
      buffer,
      options?.contentType,
    );
    this.logger.debug(`CSV private aerodromes decode: TextDecoder("${label}")`);
    const text = new TextDecoder(label).decode(buffer);
    const lines = text.replace(/\r\n/g, '\n');
    const csvStart = lines.indexOf('\n');
    if (csvStart < 0) {
      throw new Error('CSV de aerodromos privados inválido: sem header');
    }
    const csvBody = lines.slice(csvStart + 1);
    const records: Record<string, string>[] = parse(csvBody, {
      delimiter: ';',
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      relax_column_count: true,
      trim: true,
      bom: true,
    });

    const rows: PrivateAerodromesCsvRow[] = [];
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

      const ciad = g(['CIAD', 'ciad']);
      if (!ciad) {
        continue;
      }

      rows.push({
        codigoOaci: g(['Cσdigo OACI', 'Código OACI', 'Codigo OACI']),
        ciad,
        nome: g(['Nome', 'nome']),
        municipio: g(['Municνpio', 'Município', 'Municipio']),
        uf: g(['UF', 'uf']),
        longitude: g(['Longitude', 'longitude']),
        latitude: g(['Latitude', 'latitude']),
        altitude: g(['Altitude', 'altitude']),
        operacaoDiurna: g(['Operaηγo Diurna', 'Operação Diurna']),
        operacaoNoturna: g(['Operaηγo Noturna', 'Operação Noturna']),
        designacao1: g(['Designaηγo 1', 'Designação 1']),
        comprimento1: g(['Comprimento 1']),
        largura1: g(['Largura 1']),
        resistencia1: g(['Resistκncia 1', 'Resistência 1']),
        superficie1: g(['Superfνcie 1', 'Superfície 1']),
        designacao2: g(['Designaηγo 2', 'Designação 2']),
        comprimento2: g(['Comprimento 2']),
        largura2: g(['Largura 2']),
        resistencia2: g(['Resistκncia 2', 'Resistência 2']),
        superficie2: g(['Superfνcie 2', 'Superfície 2']),
        portariaRegistro: g(['Portaria de Registro']),
        linkPortaria: g(['Link Portaria']),
        latGeoPoint: g(['LATGEOPOINT', 'LatGeoPoint']),
        lonGeoPoint: g(['LONGEOPOINT', 'LonGeoPoint']),
      });
    }

    return rows;
  }
}
