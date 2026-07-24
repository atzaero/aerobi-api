import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { EMAIL_LOGO_CID } from '../components/email-colors';

/**
 * Logo da marca anexada aos emails como recurso embutido (CID). Anexar via
 * `cid:` é o método mais confiável entre clientes (não depende de URL pública
 * nem de "exibir imagens externas"). O PNG é lido uma única vez e cacheado em
 * memória; se não for encontrado, o email segue sem a logo (o `<img>` degrada
 * para o texto alternativo) — a ausência do asset nunca falha o envio.
 */

/** Anexo nodemailer com recurso embutido por Content-ID. */
export interface EmailLogoAttachment {
  filename: string;
  content: Buffer;
  cid: string;
  contentType: string;
}

/**
 * Caminhos candidatos do PNG: primeiro relativo ao módulo compilado
 * (tsc → `dist/src/common/email/utils` com o asset copiado pelo `assets` do
 * nest-cli.json), depois relativo ao cwd (dev com webpack HMR, onde
 * `__dirname` não aponta para a árvore de fontes).
 */
const LOGO_PATH_CANDIDATES = [
  join(__dirname, '..', 'assets', 'aerobi-logo-email.png'),
  join(
    process.cwd(),
    'src',
    'common',
    'email',
    'assets',
    'aerobi-logo-email.png',
  ),
];

let cachedLogo: Buffer | null = null;
let warnedMissing = false;

/**
 * Attachments da logo para `MailerService.sendMail` (array vazio se o PNG não
 * for encontrado — warn uma única vez via `logger`, quando fornecido).
 */
export function getLogoAttachments(logger?: {
  warn(message: string): void;
}): EmailLogoAttachment[] {
  if (!cachedLogo) {
    for (const path of LOGO_PATH_CANDIDATES) {
      try {
        cachedLogo = readFileSync(path);
        break;
      } catch {
        /** Candidato ausente — tenta o próximo caminho. */
      }
    }
  }

  if (!cachedLogo) {
    if (!warnedMissing) {
      warnedMissing = true;
      logger?.warn(
        `Email logo asset not found (tried: ${LOGO_PATH_CANDIDATES.join(', ')}) - sending emails without logo attachment`,
      );
    }
    return [];
  }

  return [
    {
      filename: 'aerobi-logo.png',
      content: cachedLogo,
      cid: EMAIL_LOGO_CID,
      contentType: 'image/png',
    },
  ];
}
