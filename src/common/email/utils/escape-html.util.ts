/**
 * Escapa texto para interpolação segura em HTML (defesa contra injeção/XSS).
 * Função pura, compartilhada pelos builders de email e pelo `EmailService`
 * (escape por padrão dos placeholders `[KEY]`).
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
