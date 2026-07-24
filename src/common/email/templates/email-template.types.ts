/**
 * Contrato de um template de email registrado em `templates/index.ts`.
 * O `html` é o documento completo (layout + componentes) com placeholders
 * `[KEY]`; `rawKeys` lista as chaves cujo valor é HTML pré-montado pelo
 * chamador e por isso NÃO deve ser escapado pelo `EmailService` na
 * renderização (todas as demais são escapadas por padrão).
 */
export interface EmailTemplateDefinition {
  html: string;
  rawKeys?: readonly string[];
}
