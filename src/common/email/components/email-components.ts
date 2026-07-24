/**
 * Átomos de HTML dos emails do Aerobi — funções puras (sem I/O) que geram
 * fragmentos inline-styled reutilizados por todos os templates. HTML 100%
 * inline e em tabelas (clientes de email não suportam `<style>` externo nem
 * `var()`). Portado do `layout.ts` do aerobi-web (epic #577).
 *
 * Contrato de escape: todo `html`/`label`/`value` recebido deve vir já escapado
 * pelo chamador quando contiver dados dinâmicos (`escapeHtml`); placeholders
 * `[KEY]` são escapados pelo `EmailService` na renderização.
 */

import { ALERT_TONES, EMAIL_COLORS, EmailAlertTone } from './email-colors';

/** Parágrafo de corpo padrão. */
export function emailParagraph(html: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${EMAIL_COLORS.text}">${html}</p>`;
}

/** Botão CTA (âncora inline-block sobre a cor da marca). */
export function emailButton(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px"><tr><td style="border-radius:8px;background:${EMAIL_COLORS.brand}"><a href="${href}" style="display:inline-block;padding:13px 24px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px">${label}</a></td></tr></table>`;
}

/**
 * Tabela de pares rótulo/valor (dados de solicitação, comprovantes, etc.).
 * `value` aceita HTML (ex.: `<strong>`, `emailCode`).
 */
export function emailInfoTable(
  rows: ReadonlyArray<{ label: string; value: string }>,
): string {
  const body = rows
    .map(
      ({ label, value }) =>
        `<tr><td style="padding:8px 12px;font-size:13px;color:${EMAIL_COLORS.muted};border-bottom:1px solid ${EMAIL_COLORS.border};white-space:nowrap;vertical-align:top">${label}</td><td style="padding:8px 12px;font-size:14px;font-weight:600;color:${EMAIL_COLORS.text};border-bottom:1px solid ${EMAIL_COLORS.border};vertical-align:top">${value}</td></tr>`,
    )
    .join('');
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;margin:0 0 24px;border:1px solid ${EMAIL_COLORS.border};border-radius:8px;overflow:hidden">${body}</table>`;
}

/** Caixa de destaque com borda lateral colorida por tom. */
export function emailAlert(tone: EmailAlertTone, html: string): string {
  const { bg, border, text } = ALERT_TONES[tone];
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 24px"><tr><td style="background:${bg};border-left:4px solid ${border};border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.55;color:${text}">${html}</td></tr></table>`;
}

/** Valor em monospace com letter-spacing (códigos de segurança, senhas). */
export function emailCode(value: string): string {
  return `<span style="font-family:'Courier New',monospace;letter-spacing:1px">${value}</span>`;
}
