import { emailParagraph } from '../components/email-components';
import { renderEmailLayout } from '../components/email-layout';
import { EmailTemplateDefinition } from './email-template.types';

/** Variáveis do template `generic_notification`. */
export type GenericNotificationVariables = Record<
  'TITLE' | 'NAME' | 'MESSAGE',
  string
>;

/**
 * Notificação genérica (título + mensagem livre). Sem uso em produção —
 * mantido como fixture de testes e fallback para avisos pontuais.
 */
export const genericNotificationTemplate: EmailTemplateDefinition = {
  html: renderEmailLayout({
    heading: '[TITLE]',
    contentHtml: emailParagraph('Olá [NAME],') + emailParagraph('[MESSAGE]'),
  }),
};
