import type { Response } from 'express';

/**
 * Sinais de truncamento de um export (ver `EXPORT_MAX_ROWS`): `truncated` indica
 * que o CSV foi cortado no teto e `total` é o número real de linhas que casam o
 * filtro.
 */
export interface CsvDownloadTruncation {
  truncated: boolean;
  total: number;
}

/**
 * Seta os headers de download de um export CSV na `Response` do Express:
 * `Content-Type`/`Content-Disposition` (attachment com `filename`) e, quando o
 * resultado foi cortado no teto, `X-Export-Truncated`/`X-Export-Total` (expostos
 * via CORS em `apply-cors.ts`) — para a UI avisar e orientar a refinar o filtro,
 * em vez de tratar o arquivo como o dataset completo.
 *
 * Deve ser chamado **dentro do handler**, só depois de o service resolver —
 * nunca via `@Header`, que o Nest aplica antes de executar o handler (se o
 * service lançar, nenhum header é setado e o `AllExceptionsFilter` responde
 * JSON, em vez de entregar o corpo de erro como `text/csv`).
 *
 * Centraliza o trecho antes duplicado nos controllers de export
 * (`aerodromes`/`groups`/`users`).
 */
export function applyCsvDownloadHeaders(
  res: Response,
  filename: string,
  { truncated, total }: CsvDownloadTruncation,
): void {
  res.set({
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="${filename}"`,
  });
  if (truncated) {
    res.set({
      'X-Export-Truncated': 'true',
      'X-Export-Total': String(total),
    });
  }
}
