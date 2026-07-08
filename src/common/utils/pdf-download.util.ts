import type { Response } from 'express';

import { buildAttachmentContentDisposition } from './content-disposition.util';

/**
 * Seta os headers de download de um PDF na `Response` do Express
 * (`Content-Type: application/pdf` + `Content-Disposition` de anexo montado via
 * `buildAttachmentContentDisposition`, com nome de ficheiro seguro).
 *
 * Deve ser chamado **dentro do handler**, só depois de o service resolver o
 * buffer — nunca via `@Header`, que o Nest aplica antes de executar o handler
 * (se o service lançar, nenhum header é setado e o `AllExceptionsFilter` responde
 * JSON, em vez de entregar o corpo de erro com `Content-Type` de PDF).
 *
 * Simétrico a `applyCsvDownloadHeaders`; centraliza o trecho antes inline no
 * controller de export PDF (primeiro export PDF da API; próximos reusam).
 */
export function applyPdfDownloadHeaders(res: Response, filename: string): void {
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': buildAttachmentContentDisposition(filename),
  });
}
