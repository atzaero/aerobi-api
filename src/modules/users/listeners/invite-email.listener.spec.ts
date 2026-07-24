import { ConfigService } from '@nestjs/config';

import { EmailService } from '@/common/email/email.service';
import { UserRole } from '@/generated/prisma/client';

import { UserInvitedEvent } from '../events/user-invited.event';
import { InviteEmailListener } from './invite-email.listener';

function mockConfig(): ConfigService {
  return {
    get: (_key: string, defaultValue?: string) => defaultValue,
  } as ConfigService;
}

describe('InviteEmailListener', () => {
  it('envia template invite com EXPIRES_AT legível e link de aceite', async () => {
    const send = jest.fn().mockResolvedValue(true);
    const emailService = { send } as unknown as EmailService;
    const listener = new InviteEmailListener(emailService, mockConfig());

    await listener.handle(
      new UserInvitedEvent(
        'user-1',
        'convidado@example.com',
        'Joana',
        UserRole.COORDINATOR,
        'token-plano',
        new Date('2026-07-30T18:00:00.000Z'),
        'Admin Ana',
      ),
    );

    expect(send).toHaveBeenCalledWith({
      to: 'convidado@example.com',
      subject: 'Convite Aerobi',
      template: 'invite',
      variables: {
        NAME: 'Joana',
        INVITED_BY: 'Admin Ana',
        ROLE_LABEL: 'Coordenador',
        ACCEPT_URL:
          'http://localhost:3000/accept-invite?token=token-plano&email=convidado%40example.com',
        EXPIRES_AT: '30/07/2026 18:00 UTC',
      },
    });
  });

  it('não propaga falha do envio (best-effort)', async () => {
    const send = jest.fn().mockRejectedValue(new Error('smtp down'));
    const emailService = { send } as unknown as EmailService;
    const listener = new InviteEmailListener(emailService, mockConfig());

    await expect(
      listener.handle(
        new UserInvitedEvent(
          'user-1',
          'convidado@example.com',
          'Joana',
          UserRole.OPERATOR,
          'token-plano',
          new Date('2026-07-30T18:00:00.000Z'),
        ),
      ),
    ).resolves.toBeUndefined();
  });
});
