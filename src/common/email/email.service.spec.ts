import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

import { EmailService } from './email.service';
import { TemplateVariables } from './templates';

type SendMailArgs = {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    cid: string;
    contentType: string;
    content: unknown;
  }>;
};

function mockConfig(values: Record<string, string | undefined>): ConfigService {
  return {
    get: (key: string, defaultValue?: string) =>
      (values[key] !== undefined ? values[key] : defaultValue) as string,
  } as ConfigService;
}

function mockMailer(
  sendMail: (args: SendMailArgs) => Promise<unknown>,
): MailerService {
  return { sendMail } as unknown as MailerService;
}

describe('EmailService', () => {
  it('resolves true on successful send and propagates subject and to', async () => {
    const calls: SendMailArgs[] = [];
    const service = new EmailService(
      mockMailer((args) => {
        calls.push(args);
        return Promise.resolve({ messageId: 'abc-123' });
      }),
      mockConfig({
        NODE_ENV: 'production',
        MAIL_USER_NO_REPLY: 'noreply@aerobi.local',
      }),
    );

    const result = await service.send({
      to: 'user@example.com',
      subject: 'Olá',
      template: 'generic_notification',
      variables: { TITLE: 'Bem-vindo', NAME: 'Elvis', MESSAGE: 'Oi!' },
    });

    expect(result).toBe(true);
    expect(calls).toHaveLength(1);
    expect(calls[0].to).toBe('user@example.com');
    expect(calls[0].subject).toBe('Olá');
    expect(calls[0].from).toBe('noreply@aerobi.local');
  });

  it('substitutes [VARIABLE] placeholders in template', async () => {
    const calls: SendMailArgs[] = [];
    const service = new EmailService(
      mockMailer((args) => {
        calls.push(args);
        return Promise.resolve({ messageId: 'id' });
      }),
      mockConfig({ NODE_ENV: 'production' }),
    );

    await service.send({
      to: 'a@b.com',
      subject: 's',
      template: 'generic_notification',
      variables: {
        TITLE: 'Assunto Importante',
        NAME: 'Maria',
        MESSAGE: 'Mensagem de teste',
      },
    });

    const html = calls[0].html;
    expect(html).toContain('Assunto Importante');
    expect(html).toContain('Maria');
    expect(html).toContain('Mensagem de teste');
    expect(html).not.toContain('[TITLE]');
    expect(html).not.toContain('[NAME]');
    expect(html).not.toContain('[MESSAGE]');
  });

  it('does not throw when variables are missing, leaves placeholders intact and warns', async () => {
    const calls: SendMailArgs[] = [];
    const service = new EmailService(
      mockMailer((args) => {
        calls.push(args);
        return Promise.resolve({ messageId: 'id' });
      }),
      mockConfig({ NODE_ENV: 'production' }),
    );

    const warnSpy = jest
      .spyOn(
        (
          service as unknown as {
            logger: { warn: (...args: unknown[]) => void };
          }
        ).logger,
        'warn',
      )
      .mockImplementation(() => undefined);

    const result = await service.send({
      to: 'a@b.com',
      subject: 's',
      template: 'generic_notification',
      /** Mapa deliberadamente incompleto — testa o warn de variável ausente. */
      variables: {
        TITLE: 'Somente titulo',
      } as TemplateVariables['generic_notification'],
    });

    expect(result).toBe(true);
    const html = calls[0].html;
    expect(html).toContain('Somente titulo');
    expect(html).toContain('[NAME]');
    expect(html).toContain('[MESSAGE]');
    expect(warnSpy).toHaveBeenCalledTimes(1);
    const firstCallArg = warnSpy.mock.calls[0][0] as string;
    expect(firstCallArg).toContain('NAME');
    expect(firstCallArg).toContain('MESSAGE');
  });

  it('returns false when mailer throws', async () => {
    const service = new EmailService(
      mockMailer(() => Promise.reject(new Error('smtp down'))),
      mockConfig({ NODE_ENV: 'production' }),
    );

    jest

      .spyOn(
        (service as unknown as { logger: { error: () => void } }).logger,
        'error',
      )
      .mockImplementation(() => undefined);

    const result = await service.send({
      to: 'user@example.com',
      subject: 'X',
      template: 'generic_notification',
    });

    expect(result).toBe(false);
  });

  it('escapes variable values by default (defense against HTML injection)', async () => {
    const calls: SendMailArgs[] = [];
    const service = new EmailService(
      mockMailer((args) => {
        calls.push(args);
        return Promise.resolve({ messageId: 'id' });
      }),
      mockConfig({ NODE_ENV: 'production' }),
    );

    await service.send({
      to: 'a@b.com',
      subject: 's',
      template: 'generic_notification',
      variables: {
        TITLE: 'Título',
        NAME: '<b>Mario & "Luigi"</b>',
        MESSAGE: 'ok',
      },
    });

    const html = calls[0].html;
    expect(html).toContain('&lt;b&gt;Mario &amp; &quot;Luigi&quot;&lt;/b&gt;');
    expect(html).not.toContain('<b>Mario');
  });

  it('injects rawKeys without escaping (pre-built HTML blocks)', async () => {
    const calls: SendMailArgs[] = [];
    const service = new EmailService(
      mockMailer((args) => {
        calls.push(args);
        return Promise.resolve({ messageId: 'id' });
      }),
      mockConfig({ NODE_ENV: 'production' }),
    );

    await service.send({
      to: 'a@b.com',
      subject: 's',
      template: 'landing_request_receipt',
      variables: {
        DESTINATION: 'SBBI',
        REQUESTER_NAME: 'Ana',
        DETAILS: '<table><tr><td>detalhes</td></tr></table>',
      },
    });

    const html = calls[0].html;
    expect(html).toContain('<table><tr><td>detalhes</td></tr></table>');
    expect(html).toContain('SBBI');
  });

  it('attaches the brand logo via CID', async () => {
    const calls: SendMailArgs[] = [];
    const service = new EmailService(
      mockMailer((args) => {
        calls.push(args);
        return Promise.resolve({ messageId: 'id' });
      }),
      mockConfig({ NODE_ENV: 'production' }),
    );

    await service.send({
      to: 'a@b.com',
      subject: 's',
      template: 'generic_notification',
      variables: { TITLE: 't', NAME: 'n', MESSAGE: 'm' },
    });

    const attachments = calls[0].attachments ?? [];
    expect(attachments).toHaveLength(1);
    expect(attachments[0].cid).toBe('aerobi-logo');
    expect(attachments[0].contentType).toBe('image/png');
  });

  it('uses explicit from when provided, overriding default', async () => {
    const calls: SendMailArgs[] = [];
    const service = new EmailService(
      mockMailer((args) => {
        calls.push(args);
        return Promise.resolve({ messageId: 'id' });
      }),
      mockConfig({
        NODE_ENV: 'production',
        MAIL_USER_NO_REPLY: 'default@aerobi.local',
      }),
    );

    await service.send({
      from: 'custom@aerobi.local',
      to: ['a@b.com', 'c@d.com'],
      subject: 'S',
      template: 'generic_notification',
      variables: { TITLE: 't', NAME: 'n', MESSAGE: 'm' },
    });

    expect(calls[0].from).toBe('custom@aerobi.local');
    expect(calls[0].to).toEqual(['a@b.com', 'c@d.com']);
  });
});
