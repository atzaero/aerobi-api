import { emailButton, emailParagraph } from '../components/email-components';
import { renderEmailLayout } from '../components/email-layout';
import { EmailTemplateDefinition } from './email-template.types';

/**
 * Variáveis do template `landing_request_staff`. `DETAILS` é HTML pré-montado
 * (tabela de dados da solicitação) — ver `rawKeys`.
 */
export type LandingRequestStaffVariables = Record<
  'DESTINATION' | 'DETAILS' | 'PANEL_URL',
  string
>;

/** Notificação ao staff: nova solicitação de pouso aguardando análise. */
export const landingRequestStaffTemplate: EmailTemplateDefinition = {
  html: renderEmailLayout({
    eyebrow: 'Solicitação de pouso',
    heading: 'Nova solicitação de pouso — [DESTINATION]',
    contentHtml:
      emailParagraph(
        'Uma nova solicitação de pouso foi registrada e aguarda análise. Os horários abaixo estão em UTC (Zulu).',
      ) +
      '[DETAILS]' +
      emailButton('Ver no painel', '[PANEL_URL]'),
  }),
  rawKeys: ['DETAILS'],
};
