/**
 * Tokens visuais dos emails do Aerobi (paleta, tipografia, CID da logo).
 * Portado do sistema de email do aerobi-web (removido no descomissionamento do
 * Firebase — ver epic #577). As cores espelham o tema do painel convertidas
 * para hex, porque `var(--token)` não funciona em clientes de email.
 */

/** Content-ID da logo anexada (referenciada como `cid:aerobi-logo` no HTML). */
export const EMAIL_LOGO_CID = 'aerobi-logo';

/** Paleta hex usada nos templates (derivada do tema shadcn do aerobi-web). */
export const EMAIL_COLORS = {
  brand: '#063f7e',
  brandDark: '#04305f',
  teal: '#067f87',
  pageBg: '#eef2f7',
  cardBg: '#ffffff',
  text: '#11243a',
  muted: '#5a6b7d',
  border: '#d7dee7',
  success: '#1e9b54',
  warning: '#c5820a',
  danger: '#d63b3b',
  info: '#1769c4',
} as const;

/** Font stack segura para clientes de email (system fonts com fallback). */
export const FONT_STACK =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

export type EmailAlertTone = 'success' | 'warning' | 'danger' | 'info';

/** Combinações de fundo/borda/texto por tom de alerta (`emailAlert`). */
export const ALERT_TONES: Record<
  EmailAlertTone,
  { bg: string; border: string; text: string }
> = {
  success: { bg: '#eaf6ef', border: EMAIL_COLORS.success, text: '#0f5e33' },
  warning: { bg: '#fdf3e2', border: EMAIL_COLORS.warning, text: '#85590a' },
  danger: { bg: '#fbeaea', border: EMAIL_COLORS.danger, text: '#922' },
  info: { bg: '#eaf1fa', border: EMAIL_COLORS.info, text: '#0c4a8a' },
};
