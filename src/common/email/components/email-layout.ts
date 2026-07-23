/**
 * Layout base de todos os emails do Aerobi — documento HTML completo com
 * header (barra da marca + logo via CID), card responsivo de 600px e rodapé
 * institucional. Função pura; portada quase 1:1 do `layout.ts` do aerobi-web
 * (epic #577). Estrutura em tabelas com estilos inline (padrão robusto de
 * email); o `<style>` no `<head>` traz apenas reset e media query — clientes
 * que o removem caem no fallback fluido (`width:100%/max-width:600px`).
 */

import { EMAIL_COLORS, EMAIL_LOGO_CID, FONT_STACK } from './email-colors';

export interface EmailLayoutParams {
  /** Sobretítulo curto em maiúsculas (eyebrow). Opcional. */
  eyebrow?: string;
  /** Título principal do email (h1). */
  heading: string;
  /** Corpo do email montado pelos átomos de `email-components`. */
  contentHtml: string;
  /** Nota final opcional (disclaimer) acima do rodapé institucional. */
  footerNote?: string;
}

/**
 * Monta o HTML completo do email (header com logo, card, rodapé institucional).
 * O ano do rodapé é avaliado na chamada — como os templates compõem o layout em
 * module-load, o ano só muda em restart da aplicação após a virada (aceitável
 * para o copyright do rodapé).
 */
export function renderEmailLayout({
  eyebrow,
  heading,
  contentHtml,
  footerNote,
}: EmailLayoutParams): string {
  const year = new Date().getFullYear();
  const eyebrowHtml = eyebrow
    ? `<p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${EMAIL_COLORS.teal}">${eyebrow}</p>`
    : '';
  const footerNoteHtml = footerNote
    ? `<p style="margin:0 0 20px;font-size:12px;line-height:1.6;color:${EMAIL_COLORS.muted}">${footerNote}</p>`
    : '';

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <title>${heading}</title>
    <style>
      /* O fundo preenche toda a altura da janela (sem faixa branca/scroll em
         telas grandes quando o conteúdo é curto). */
      html, body { margin: 0; padding: 0; height: 100%; }
      /* Responsivo: clientes que suportam <style> (Apple Mail, Gmail app, etc.)
         reduzem padding e dimensões em telas pequenas. Onde o <style> é
         removido, o fallback fluido (width:100%/max-width:600px) já cuida. */
      @media only screen and (max-width: 600px) {
        .ae-card { border-radius: 0 !important; border-left: 0 !important; border-right: 0 !important; }
        .ae-pad { padding-left: 20px !important; padding-right: 20px !important; }
        .ae-logo { width: 150px !important; }
        .ae-h1 { font-size: 19px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:${EMAIL_COLORS.pageBg};font-family:${FONT_STACK};color:${EMAIL_COLORS.text}">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" height="100%" style="width:100%;height:100%;background:${EMAIL_COLORS.pageBg};border-collapse:collapse">
      <tr>
        <td align="center" valign="top" style="padding:24px 12px">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" class="ae-card" style="width:100%;max-width:600px;background:${EMAIL_COLORS.cardBg};border:1px solid ${EMAIL_COLORS.border};border-radius:12px;overflow:hidden">
            <tr><td style="height:4px;background:${EMAIL_COLORS.brand};font-size:0;line-height:0">&nbsp;</td></tr>
            <tr>
              <td align="center" style="padding:28px 24px 8px">
                <img src="cid:${EMAIL_LOGO_CID}" alt="AeroBI" width="180" class="ae-logo" style="display:block;border:0;width:180px;max-width:60%;height:auto" />
              </td>
            </tr>
            <tr>
              <td class="ae-pad" style="padding:16px 32px 8px">
                ${eyebrowHtml}
                <h1 class="ae-h1" style="margin:0 0 16px;font-size:21px;font-weight:700;line-height:1.3;color:${EMAIL_COLORS.text}">${heading}</h1>
              </td>
            </tr>
            <tr>
              <td class="ae-pad" style="padding:0 32px 8px">
                ${contentHtml}
                ${footerNoteHtml}
              </td>
            </tr>
            <tr><td class="ae-pad" style="border-top:1px solid ${EMAIL_COLORS.border};padding:20px 32px;background:#f8fafc">
              <p style="margin:0;font-size:11px;line-height:1.6;color:${EMAIL_COLORS.muted}">© ${year} Aerobi · Este é um e-mail automático, não responda.</p>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
