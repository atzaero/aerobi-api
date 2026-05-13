import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';

import { TokenRepository } from './repositories/token.repository';
import { TOKEN_REPOSITORY } from './repositories/token.repository.interface';
import { EmailVerificationTokenService } from './services/email-verification-token.service';
import { InviteTokenService } from './services/invite-token.service';
import { PasswordResetTokenService } from './services/password-reset-token.service';
import { TokenGenerationService } from './services/token-generation.service';
import { TokenValidationService } from './services/token-validation.service';

/**
 * Módulo de tokens genéricos (email verification, password reset, OTP).
 *
 * O `ErrorMessageModule` é `@Global()` e não precisa ser importado aqui.
 * Exporta todos os serviços e o token de injeção `TOKEN_REPOSITORY` para que
 * outros módulos possam construir / validar tokens sem acoplar ao repositório
 * concreto.
 */
@Module({
  imports: [PrismaModule],
  providers: [
    TokenGenerationService,
    TokenValidationService,
    EmailVerificationTokenService,
    PasswordResetTokenService,
    InviteTokenService,
    { provide: TOKEN_REPOSITORY, useClass: TokenRepository },
  ],
  exports: [
    TokenGenerationService,
    TokenValidationService,
    EmailVerificationTokenService,
    PasswordResetTokenService,
    InviteTokenService,
    TOKEN_REPOSITORY,
  ],
})
export class TokensModule {}
