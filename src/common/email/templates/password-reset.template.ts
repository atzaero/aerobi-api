import { emailButton, emailParagraph } from '../components/email-components';
import { renderEmailLayout } from '../components/email-layout';
import { EmailTemplateDefinition } from './email-template.types';

/** Variáveis do template `password_reset`. */
export type PasswordResetVariables = Record<
  'NAME' | 'EXPIRES_AT' | 'RESET_URL' | 'IP_ADDRESS',
  string
>;

/** Redefinição de senha solicitada pelo próprio usuário (ou por admin). */
export const passwordResetTemplate: EmailTemplateDefinition = {
  html: renderEmailLayout({
    eyebrow: 'Segurança da conta',
    heading: 'Redefinição de senha',
    contentHtml:
      emailParagraph('Olá [NAME],') +
      emailParagraph(
        'Recebemos uma solicitação para redefinir sua senha na Aerobi. Para criar uma nova senha, clique no link abaixo — ele expira em [EXPIRES_AT]:',
      ) +
      emailButton('Redefinir minha senha', '[RESET_URL]'),
    footerNote:
      'Solicitação originada do IP [IP_ADDRESS]. Se não foi você, ignore este email — sua senha atual continua válida.',
  }),
};
