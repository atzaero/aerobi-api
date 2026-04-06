import { Injectable, Logger } from '@nestjs/common';
import { parse } from 'csv-parse/sync';

import type { PublicAerodromesCsvRow } from '../types/public-aerodromes-csv-row.type';
import { resolvePublicAerodromesCsvTextDecoderLabel } from '../utils/public-aerodromes-csv-encoding';

export type ParsePublicAerodromesCsvBufferOptions = {
  contentType?: string;
};

@Injectable()
export class PublicAerodromesCsvParserService {
  private readonly logger = new Logger(PublicAerodromesCsvParserService.name);

  parseBuffer(
    buffer: Buffer,
    options?: ParsePublicAerodromesCsvBufferOptions,
  ): PublicAerodromesCsvRow[] {
    const label = resolvePublicAerodromesCsvTextDecoderLabel(
      buffer,
      options?.contentType,
    );
    this.logger.debug(`CSV public aerodromes decode: TextDecoder("${label}")`);
    const text = new TextDecoder(label).decode(buffer);
    const lines = text.replace(/\r\n/g, '\n');
    const csvStart = lines.indexOf('\n');
    if (csvStart < 0) {
      throw new Error('CSV de aerodromos públicos inválido: sem header');
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

    const rows: PublicAerodromesCsvRow[] = [];
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
        municipioServido: g([
          'Munic\u00edpio Servido',
          'Municνpio Servido',
          'Município Servido',
          'Municipio Servido',
        ]),
        ufServido: g(['UF Servido']),
        latitude: g(['Latitude', 'latitude']),
        longitude: g(['Longitude', 'longitude']),
        altitude: g(['Altitude', 'altitude']),
        operacaoDiurna: g(['Operaηγo Diurna', 'Operação Diurna']),
        operacaoNoturna: g(['Operaηγo Noturna', 'Operação Noturna']),
        situacao: g(['Situaηγo', 'Situação', 'Situacao']),
        validadeRegistro: g(['Validade do Registro']),
        portariaRegistro: g(['Portaria de Registro']),
        linkPortaria: g(['Link Portaria']),
        latGeoPoint: g(['LATGEOPOINT', 'LatGeoPoint']),
        lonGeoPoint: g(['LONGEOPOINT', 'LonGeoPoint']),
      });
    }

    return rows;
  }
}
