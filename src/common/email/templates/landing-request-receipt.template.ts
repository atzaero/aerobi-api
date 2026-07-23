import { emailParagraph } from '../components/email-components';
import { renderEmailLayout } from '../components/email-layout';
import { EmailTemplateDefinition } from './email-template.types';

/**
 * Variáveis do template `landing_request_receipt`. `DETAILS` é HTML
 * pré-montado (tabela de dados da solicitação) — ver `rawKeys`.
 */
export type LandingRequestReceiptVariables = Record<
  'DESTINATION' | 'REQUESTER_NAME' | 'DETAILS',
  string
>;

/** Comprovante da solicitação de pouso enviado ao solicitante. */
export const landingRequestReceiptTemplate: EmailTemplateDefinition = {
  html: renderEmailLayout({
    eyebrow: 'Comprovante de solicitação',
    heading: 'Comprovante — solicitação de pouso em [DESTINATION]',
    contentHtml:
      emailParagraph('Olá [REQUESTER_NAME],') +
      emailParagraph(
        'Recebemos sua solicitação de pouso. Guarde este e-mail como comprovante. Os horários abaixo estão em UTC (Zulu).',
      ) +
      '[DETAILS]' +
      emailParagraph(
        'Status atual: <strong>Pendente</strong>. Você será avisado por e-mail quando o coordenador responder.',
      ),
  }),
  rawKeys: ['DETAILS'],
};
