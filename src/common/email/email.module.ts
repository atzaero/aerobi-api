import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import * as nodemailer from 'nodemailer';

import { EmailService } from './email.service';
import { logEtherealAccountCreated } from './utils/ethereal-logger.util';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('EmailModule');
        const isDev =
          configService.get<string>('NODE_ENV', 'development') ===
          'development';
        const defaultFrom =
          configService.get<string>('MAIL_USER_NO_REPLY') ||
          'noreply@aerobi.local';

        if (isDev) {
          const username = configService.get<string>('ETHEREAL_USERNAME');
          const password = configService.get<string>('ETHEREAL_PASSWORD');

          let account: { user: string; pass: string };
          if (!username || !password) {
            logger.log('Creating temporary Ethereal test account...');
            const testAccount = await nodemailer.createTestAccount();
            logEtherealAccountCreated(
              testAccount.user,
              testAccount.pass,
              logger,
            );
            account = { user: testAccount.user, pass: testAccount.pass };
          } else {
            logger.log('Using configured Ethereal credentials');
            account = { user: username, pass: password };
          }

          return {
            transport: {
              host: 'smtp.ethereal.email',
              port: 587,
              secure: false,
              auth: { user: account.user, pass: account.pass },
            },
            defaults: { from: defaultFrom },
          };
        }

        const host = configService.get<string>('MAIL_HOST');
        const port = Number(configService.get<string>('MAIL_PORT', '587'));
        const secure = configService.get<string>('MAIL_SECURE') === 'true';
        const user = configService.get<string>('MAIL_USER');
        const pass = configService.get<string>('MAIL_PASS');

        if (!host || !user || !pass) {
          throw new Error(
            'SMTP configuration is required in production. Please configure MAIL_HOST, MAIL_USER and MAIL_PASS.',
          );
        }

        return {
          transport: {
            host,
            port,
            secure,
            auth: { user, pass },
          },
          defaults: { from: defaultFrom },
        };
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
