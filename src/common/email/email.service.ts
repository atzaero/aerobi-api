import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

import { getErrorMessage } from '@/common/utils/error.util';

import { EmailTemplate, TemplateVariables, templates } from './templates';
import { getLogoAttachments } from './utils/email-logo.util';
import { escapeHtml } from './utils/escape-html.util';
import { logEtherealPreview } from './utils/ethereal-logger.util';

/**
 * Parâmetros de envio para um template específico — `variables` é checado em
 * compile-time contra as chaves declaradas pelo template (`TemplateVariables`).
 */
export interface SendMailParamsFor<T extends EmailTemplate> {
  from?: string;
  to: string | string[];
  subject: string;
  template: T;
  variables?: TemplateVariables[T];
}

/**
 * União discriminada por `template` — forma usada por builders que montam os
 * parâmetros fora do call-site do envio (ex.: landing-requests).
 */
export type SendMailParams = {
  [T in EmailTemplate]: SendMailParamsFor<T>;
}[EmailTemplate];

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly defaultFrom: string;
  private readonly isDevelopment: boolean;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.defaultFrom =
      this.configService.get<string>('MAIL_USER_NO_REPLY') ||
      'noreply@aerobi.local';
    this.isDevelopment =
      (this.configService.get<string>('NODE_ENV') || 'development') !==
      'production';

    this.logger.debug(
      `EmailService initialized - defaultFrom=${this.defaultFrom} isDevelopment=${this.isDevelopment}`,
    );
  }

  /**
   * Envia um email a partir de um template pré-definido.
   *
   * - `template` é uma chave de `templates` (src/common/email/templates);
   *   `variables` é tipado por template via `TemplateVariables`.
   * - `variables` substitui `[VARIABLE]` → `variables['VARIABLE']` no HTML,
   *   com escape HTML por padrão — só as chaves em `rawKeys` do template
   *   passam sem escape (HTML pré-montado pelo chamador). Variáveis ausentes
   *   no mapa geram warning mas não interrompem o envio.
   * - A logo da marca vai como attachment CID (`getLogoAttachments`).
   * - Em `NODE_ENV=development`, loga o preview URL do Ethereal quando disponível.
   * - Erros do mailer são capturados, logados e resultam em `false`.
   *
   * @returns `true` em sucesso, `false` em falha.
   */
  async send<T extends EmailTemplate>({
    from,
    to,
    subject,
    template,
    variables,
  }: SendMailParamsFor<T>): Promise<boolean> {
    const recipients = Array.isArray(to) ? to.join(', ') : to;
    const fromAddress = from ?? this.defaultFrom;

    this.logger.log(
      `Preparing email - to=${recipients} subject="${subject}" template=${template}`,
    );

    try {
      const html = this.renderTemplate(template, variables ?? {});

      const info = (await this.mailerService.sendMail({
        from: fromAddress,
        to,
        subject,
        html,
        attachments: getLogoAttachments(this.logger),
      })) as SMTPTransport.SentMessageInfo;

      if (this.isDevelopment) {
        logEtherealPreview(info, this.logger);
      }

      const messageId = this.extractMessageId(info);
      this.logger.log(
        `Email sent - to=${recipients} subject="${subject}" messageId=${messageId}`,
      );
      return true;
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      this.logger.error(
        `Failed to send email - to=${recipients} subject="${subject}": ${message}`,
      );
      return false;
    }
  }

  /**
   * Substitui os placeholders `[KEY]` pelo valor correspondente em `variables`,
   * escapando HTML por padrão — chaves listadas em `rawKeys` do template são
   * injetadas sem escape (HTML pré-montado pelo chamador). Variáveis declaradas
   * no template mas ausentes do mapa logam warning e permanecem como `[KEY]`
   * no HTML final (não falha o envio).
   */
  private renderTemplate(
    template: EmailTemplate,
    variables: Record<string, string>,
  ): string {
    const { html: source, rawKeys } = templates[template];
    const rawKeySet = new Set<string>(rawKeys ?? []);
    const placeholderRegex = /\[([A-Z0-9_]+)\]/g;
    const missing = new Set<string>();

    const rendered = source.replace(placeholderRegex, (match, key: string) => {
      if (Object.prototype.hasOwnProperty.call(variables, key)) {
        return rawKeySet.has(key) ? variables[key] : escapeHtml(variables[key]);
      }
      missing.add(key);
      return match;
    });

    if (missing.size > 0) {
      this.logger.warn(
        `Template "${template}" has unresolved variables: ${Array.from(missing).join(', ')}`,
      );
    }

    return rendered;
  }

  private extractMessageId(info: SMTPTransport.SentMessageInfo): string {
    const record = info as unknown as Record<string, unknown>;
    if (
      record &&
      typeof record === 'object' &&
      'messageId' in record &&
      typeof record.messageId === 'string'
    ) {
      return record.messageId;
    }
    return 'unknown';
  }
}
