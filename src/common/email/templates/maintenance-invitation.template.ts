import {
  emailAlert,
  emailButton,
  emailCode,
  emailInfoTable,
  emailParagraph,
} from '../components/email-components';
import { renderEmailLayout } from '../components/email-layout';
import { EmailTemplateDefinition } from './email-template.types';

/** Variáveis do template `maintenance_invitation`. */
export type MaintenanceInvitationVariables = Record<
  'AERODROME_LABEL' | 'LINK' | 'SECURITY_CODE',
  string
>;

/** Convite para enviar sugestões numa manutenção (página pública + código). */
export const maintenanceInvitationTemplate: EmailTemplateDefinition = {
  html: renderEmailLayout({
    eyebrow: 'Convite — manutenção',
    heading: 'Convite para enviar sugestões',
    contentHtml:
      emailParagraph(
        'Você foi convidado(a) a contribuir com sugestões para a manutenção de <strong>[AERODROME_LABEL]</strong>. Acesse a página abaixo e informe o código de segurança para enviar sua sugestão.',
      ) +
      emailButton('Enviar minha sugestão', '[LINK]') +
      emailInfoTable([
        { label: 'Aeródromo', value: '[AERODROME_LABEL]' },
        { label: 'Código de segurança', value: emailCode('[SECURITY_CODE]') },
      ]) +
      emailAlert(
        'info',
        'O código de segurança é pessoal e necessário para registrar sua sugestão. Não compartilhe este e-mail.',
      ),
  }),
};
