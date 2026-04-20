/**
 * Dicionário de templates HTML para emails enviados pelo EmailService.
 *
 * Placeholders usam o formato `[VARIABLE]` e são substituídos pelas chaves
 * do objeto `variables` passado em `EmailService.send()`.
 */
export const templates = {
  generic_notification: `
    <h1>[TITLE]</h1>
    <p>Olá [NAME],</p>
    <p>[MESSAGE]</p>
  `,
} as const;

export type EmailTemplate = keyof typeof templates;
