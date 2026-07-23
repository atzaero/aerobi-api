import { emailButton, emailParagraph } from '../components/email-components';
import { renderEmailLayout } from '../components/email-layout';
import { EmailTemplateDefinition } from './email-template.types';

/** Variáveis do template `invite`. */
export type InviteVariables = Record<
  'NAME' | 'INVITED_BY' | 'ROLE_LABEL' | 'EXPIRES_AT' | 'ACCEPT_URL',
  string
>;

/** Convite de onboarding: o convidado define a própria senha pelo link. */
export const inviteTemplate: EmailTemplateDefinition = {
  html: renderEmailLayout({
    eyebrow: 'Convite',
    heading: 'Você foi convidado para a Aerobi',
    contentHtml:
      emailParagraph('Olá [NAME],') +
      emailParagraph(
        '[INVITED_BY] convidou você para a Aerobi com a permissão <strong>[ROLE_LABEL]</strong>.',
      ) +
      emailParagraph(
        'Para concluir seu cadastro, defina sua senha clicando no link abaixo — ele expira em [EXPIRES_AT]:',
      ) +
      emailButton('Aceitar convite e definir senha', '[ACCEPT_URL]'),
    footerNote:
      'Se você não esperava este email, pode ignorá-lo — o convite expirará automaticamente.',
  }),
};
