/**
 * Serialização CSV genérica para os exports de listagem — primeiro export da
 * API, mantido genérico para reuso pelos próximos módulos. Espelha
 * `aerobi-web/src/lib/csv.ts`: funções puras, montagem server-side (a rota de
 * export recebe as linhas já buscadas + as colunas da entidade e devolve a
 * string pronta para download).
 */

/** Teto de linhas por export — guarda contra exports gigantes acidentais. */
export const EXPORT_MAX_ROWS = 50_000;

/** Valor bruto que uma célula aceita; a formatação fica no `accessor`. */
export type CsvCellValue = string | number | null | undefined;

/**
 * Definição de uma coluna do CSV. O `accessor` extrai/formata o valor da linha
 * — toda lógica de domínio (labels, datas, joins) vive aqui, mantendo o `toCsv`
 * puramente mecânico.
 */
export interface CsvColumn<T> {
  header: string;
  accessor: (row: T) => CsvCellValue;
}

/**
 * BOM UTF-8: faz o Excel abrir acentos pt-BR corretamente. (Excel no locale
 * pt-BR usa `;` como separador ao abrir por duplo-clique; este CSV usa `,`
 * conforme RFC 4180 — abre certo via importação / Google Sheets / LibreOffice.)
 */
const UTF8_BOM = '\uFEFF';
/** CSV padrão (RFC 4180) usa CRLF como separador de linha. */
const ROW_SEPARATOR = '\r\n';

/**
 * Escapa uma célula conforme RFC 4180: envolve em aspas duplas quando contém
 * vírgula, aspas ou quebra de linha, e duplica as aspas internas.
 * `null`/`undefined` viram string vazia; números viram sua representação
 * decimal.
 */
function escapeCell(value: CsvCellValue): string {
  if (value === null || value === undefined) return '';
  const str = typeof value === 'number' ? String(value) : value;
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Serializa `rows` em uma string CSV com BOM UTF-8, cabeçalho a partir de
 * `columns` e células escapadas. A linha de cabeçalho está sempre presente,
 * mesmo sem dados (arquivo só com os títulos das colunas).
 */
export function toCsv<T>(
  rows: readonly T[],
  columns: readonly CsvColumn<T>[],
): string {
  const header = columns.map((col) => escapeCell(col.header)).join(',');
  const body = rows.map((row) =>
    columns.map((col) => escapeCell(col.accessor(row))).join(','),
  );
  return UTF8_BOM + [header, ...body].join(ROW_SEPARATOR);
}
