import { ConfigService } from '@nestjs/config';

import { EmailService } from '@/common/email/email.service';

import { PasswordResetTokenSentEvent } from '../events/password-reset-token-sent.event';
import { PasswordResetEmailListener } from './password-reset-email.listener';

function mockConfig(): ConfigService {
  return {
    get: (_key: string, defaultValue?: string) => defaultValue,
  } as ConfigService;
}

describe('PasswordResetEmailListener', () => {
  it('envia template password_reset com EXPIRES_AT legível e link de reset', async () => {
    const send = jest.fn().mockResolvedValue(true);
    const emailService = { send } as unknown as EmailService;
    const listener = new PasswordResetEmailListener(emailService, mockConfig());

    await listener.handle(
      new PasswordResetTokenSentEvent(
        'user-1',
        'maria@example.com',
        'Maria',
        'token-plano',
        new Date('2026-07-24T21:05:00.000Z'),
        '203.0.113.7',
      ),
    );

    expect(send).toHaveBeenCalledWith({
      to: 'maria@example.com',
      subject: 'Redefinição de senha — Aerobi',
      template: 'password_reset',
      variables: {
        NAME: 'Maria',
        RESET_URL:
          'http://localhost:3000/reset-password?token=token-plano&email=maria%40example.com',
        EXPIRES_AT: '24/07/2026 21:05 UTC',
        IP_ADDRESS: '203.0.113.7',
      },
    });
  });

  it('usa "desconhecido" quando não há IP e não propaga falha do envio', async () => {
    const send = jest.fn().mockRejectedValue(new Error('smtp down'));
    const emailService = { send } as unknown as EmailService;
    const listener = new PasswordResetEmailListener(emailService, mockConfig());

    await expect(
      listener.handle(
        new PasswordResetTokenSentEvent(
          'user-1',
          'maria@example.com',
          'Maria',
          'token-plano',
          new Date('2026-07-24T21:05:00.000Z'),
        ),
      ),
    ).resolves.toBeUndefined();
  });
});
