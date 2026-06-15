/**
 * Converte um valor de configuração (`string | number | undefined`) num inteiro
 * positivo. Devolve `fallback` quando o valor é ausente, não numérico ou ≤ 0.
 */
export function parsePositiveInt(
  raw: string | number | undefined,
  fallback: number,
): number {
  const parsed =
    typeof raw === 'number' ? raw : Number.parseInt(String(raw ?? ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
