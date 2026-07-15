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
 * Caracteres que, no início de uma célula de texto, levam Excel/LibreOffice/
 * Google Sheets a interpretarem o conteúdo como fórmula (CSV/formula
 * injection): os gatilhos clássicos `= + - @` e os whitespaces de controle
 * `\t`/`\r`, que alguns parsers também tratam como prefixo de fórmula.
 */
const FORMULA_INJECTION_TRIGGERS = ['=', '+', '-', '@', '\t', '\r'];

/**
 * Neutraliza CSV/formula injection: quando a string começa com um gatilho de
 * fórmula, prefixa com apóstrofo (`'`) — convenção que faz o spreadsheet
 * tratar a célula como texto literal, anulando a avaliação sem alterar o valor
 * visível. Aplicado apenas a strings (campos de texto livre vindos da API, ex.:
 * `name`, `ownerId`, `createdBy`); os números vêm da nossa própria
 * `String(number)` e nunca são vetor de injeção.
 */
function neutralizeFormulaInjection(str: string): string {
  if (str.length > 0 && FORMULA_INJECTION_TRIGGERS.includes(str[0])) {
    return `'${str}`;
  }
  return str;
}

/**
 * Escapa uma célula: primeiro neutraliza formula injection (strings), depois
 * aplica RFC 4180 — envolve em aspas duplas quando contém vírgula, aspas ou
 * quebra de linha, e duplica as aspas internas. `null`/`undefined` viram string
 * vazia; números viram sua representação decimal (sem guard, pois são seguros).
 */
function escapeCell(value: CsvCellValue): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return String(value);
  const str = neutralizeFormulaInjection(value);
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
