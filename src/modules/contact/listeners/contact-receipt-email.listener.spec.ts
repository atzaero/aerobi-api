import { EmailService } from '@/common/email/email.service';
import { ContactType } from '@/generated/prisma/client';

import { ContactCreatedEvent } from '../events/contact-created.event';
import { ContactReceiptEmailListener } from './contact-receipt-email.listener';

describe('ContactReceiptEmailListener', () => {
  it('envia template contact_receipt e retorna boolean', async () => {
    const send = jest.fn().mockResolvedValue(true);
    const emailService = { send } as unknown as EmailService;
    const listener = new ContactReceiptEmailListener(emailService);

    const result = await listener.handle(
      new ContactCreatedEvent(
        'id-1',
        'user@example.com',
        'Maria',
        '+5511999999999',
        'Olá, preciso de ajuda com mais de dez chars.',
        ContactType.question,
      ),
    );

    expect(result).toBe(true);
    expect(send).toHaveBeenCalledWith({
      to: 'user@example.com',
      subject: 'Comprovante — sua mensagem para o Aerobi',
      template: 'contact_receipt',
      variables: {
        NAME: 'Maria',
        EMAIL: 'user@example.com',
        PHONE: '+5511999999999',
        TYPE_LABEL: 'Dúvida',
        MESSAGE: 'Olá, preciso de ajuda com mais de dez chars.',
      },
    });
  });
});
