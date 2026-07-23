import { emailParagraph } from '../components/email-components';
import { renderEmailLayout } from '../components/email-layout';
import { EmailTemplateDefinition } from './email-template.types';

/**
 * Variáveis do template `landing_request_decided`. `DETAILS` (tabela de dados)
 * e `OBSERVATION_BLOCK` (alerta com a observação do coordenador, quando
 * existir) são HTML pré-montado — ver `rawKeys`.
 */
export type LandingRequestDecidedVariables = Record<
  | 'TITLE'
  | 'REQUESTER_NAME'
  | 'DESTINATION'
  | 'DECISION_LABEL'
  | 'DETAILS'
  | 'OBSERVATION_BLOCK'
  | 'RESPONDED_BY',
  string
>;

/** Resposta (aprovada/não aprovada) da solicitação de pouso ao solicitante. */
export const landingRequestDecidedTemplate: EmailTemplateDefinition = {
  html: renderEmailLayout({
    eyebrow: 'Solicitação de pouso',
    heading: '[TITLE]',
    contentHtml:
      emailParagraph('Olá [REQUESTER_NAME],') +
      emailParagraph(
        'Sua solicitação de pouso em [DESTINATION] foi <strong>[DECISION_LABEL]</strong>. Os horários abaixo estão em UTC (Zulu).',
      ) +
      '[DETAILS]' +
      '[OBSERVATION_BLOCK]' +
      emailParagraph('Respondido por [RESPONDED_BY].'),
  }),
  rawKeys: ['DETAILS', 'OBSERVATION_BLOCK'],
};
