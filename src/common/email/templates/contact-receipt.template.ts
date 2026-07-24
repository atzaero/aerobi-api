import { emailInfoTable, emailParagraph } from '../components/email-components';
import { renderEmailLayout } from '../components/email-layout';
import { EmailTemplateDefinition } from './email-template.types';

/** Variáveis do template `contact_receipt`. */
export type ContactReceiptVariables = Record<
  'NAME' | 'EMAIL' | 'PHONE' | 'TYPE_LABEL' | 'MESSAGE',
  string
>;

/** Comprovante do formulário Fale Conosco enviado ao remetente. */
export const contactReceiptTemplate: EmailTemplateDefinition = {
  html: renderEmailLayout({
    eyebrow: 'Comprovante',
    heading: 'Recebemos sua mensagem',
    contentHtml:
      emailParagraph('Olá [NAME],') +
      emailParagraph(
        'Sua mensagem foi registrada com sucesso. Guarde este e-mail como comprovante.',
      ) +
      emailInfoTable([
        { label: 'Nome', value: '[NAME]' },
        { label: 'E-mail', value: '[EMAIL]' },
        { label: 'Telefone', value: '[PHONE]' },
        { label: 'Tipo', value: '[TYPE_LABEL]' },
        { label: 'Mensagem', value: '[MESSAGE]' },
      ]),
    footerNote:
      'Nossa equipe analisará sua mensagem e entrará em contato quando necessário.',
  }),
};
