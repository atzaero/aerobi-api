/**
 * Normaliza uma matrícula/marcas para consulta ao RAB (espelha
 * `normalizeRabMarcasQuery` do `aerobi-web`): remove tudo que não é
 * alfanumérico e passa a maiúsculas (`PR-CAP` → `PRCAP`). É a forma como as
 * `marcas` são armazenadas na tabela `rab_row` (sem hífen), então serve tanto
 * para montar a query quanto para comparar exatamente o resultado.
 */
export function normalizeRabMarcas(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}
