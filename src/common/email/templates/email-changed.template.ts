import {
  emailAlert,
  emailInfoTable,
  emailParagraph,
} from '../components/email-components';
import { renderEmailLayout } from '../components/email-layout';
import { EmailTemplateDefinition } from './email-template.types';

/** Variáveis do template `email_changed`. */
export type EmailChangedVariables = Record<
  'NAME' | 'OLD_EMAIL' | 'NEW_EMAIL',
  string
>;

/** Aviso de segurança: email de acesso alterado por um administrador. */
export const emailChangedTemplate: EmailTemplateDefinition = {
  html: renderEmailLayout({
    eyebrow: 'Segurança da conta',
    heading: 'Seu email de acesso foi alterado',
    contentHtml:
      emailParagraph('Olá [NAME],') +
      emailParagraph(
        'O email da sua conta Aerobi foi alterado por um administrador.',
      ) +
      emailInfoTable([
        { label: 'Email anterior', value: '[OLD_EMAIL]' },
        { label: 'Novo email', value: '[NEW_EMAIL]' },
      ]) +
      emailParagraph(
        'Por segurança, todas as sessões ativas foram encerradas — faça login novamente usando o novo email.',
      ) +
      emailAlert(
        'warning',
        'Se você não reconhece esta alteração, contate o administrador da sua organização imediatamente.',
      ),
  }),
};
