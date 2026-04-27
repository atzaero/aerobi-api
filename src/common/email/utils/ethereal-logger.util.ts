import { Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

/**
 * Loga o URL de preview do Ethereal quando disponível.
 *
 * `nodemailer.getTestMessageUrl` retorna `false` quando o `info` não é de
 * uma conta de teste do Ethereal, caso em que este helper não loga nada.
 */
export function logEtherealPreview(
  info: SMTPTransport.SentMessageInfo,
  logger: Logger,
): void {
  try {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      logger.log(`Ethereal preview URL: ${String(previewUrl)}`);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.debug(`Could not get Ethereal preview URL: ${message}`);
  }
}

/**
 * Loga os dados de uma conta Ethereal criada automaticamente via
 * `nodemailer.createTestAccount()`. Útil em desenvolvimento.
 */
export function logEtherealAccountCreated(
  username: string,
  password: string,
  logger: Logger,
): void {
  logger.log('Ethereal test account created automatically');
  logger.log(`  Username: ${username}`);
  logger.log(`  Password: ${password}`);
  logger.log(
    '  Note: conta temporária, expira após 48h. Para uma conta persistente, configure ETHEREAL_USERNAME e ETHEREAL_PASSWORD no .env.',
  );
}
