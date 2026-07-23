import {
  emailAlert,
  emailInfoTable,
  emailParagraph,
} from '../components/email-components';
import { renderEmailLayout } from '../components/email-layout';
import { EmailTemplateDefinition } from './email-template.types';

/** Variáveis do template `landing_non_conformity`. */
export type LandingNonConformityVariables = Record<
  'REGISTRATION' | 'AERODROME' | 'OCCURRED_AT',
  string
>;

/** Alerta de conformidade: pouso detectado sem solicitação correspondente. */
export const landingNonConformityTemplate: EmailTemplateDefinition = {
  html: renderEmailLayout({
    eyebrow: 'Conformidade',
    heading: 'Pouso sem solicitação de aterragem',
    contentHtml:
      emailParagraph(
        'Foi detectado um pouso sem uma solicitação de pouso correspondente registrada.',
      ) +
      emailInfoTable([
        { label: 'Matrícula', value: '[REGISTRATION]' },
        { label: 'Aeródromo', value: '[AERODROME]' },
        { label: 'Ocorrido em', value: '[OCCURRED_AT]' },
      ]) +
      emailAlert(
        'danger',
        'Verifique a operação e tome as providências de conformidade cabíveis.',
      ),
  }),
};
