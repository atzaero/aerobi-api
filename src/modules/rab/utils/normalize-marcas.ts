/**
 * Normaliza uma matrícula para a **forma canônica** usada na coluna `marcas`
 * das `rab_row` (dados da ANAC): sem hífen e sem espaços, em maiúsculas. A
 * matrícula pode chegar em formatos variados ("PT-KOB", "pt kob", "PTKOB");
 * todos colapsam para a mesma chave de busca ("PTKOB").
 *
 * É uma decisão de domínio (como interpretar uma matrícula), por isso vive aqui
 * e é aplicada na camada de service antes de consultar o repositório — que
 * recebe a forma já canônica.
 */
export function normalizeMarcas(registration: string): string {
  return registration.replace(/[\s-]/g, '').toUpperCase();
}
