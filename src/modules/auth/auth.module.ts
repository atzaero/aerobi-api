import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { LoginController } from './controllers/login.controller';
import { LogoutController } from './controllers/logout.controller';
import { MeController } from './controllers/me.controller';
import { RefreshSessionController } from './controllers/refresh-session.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { REFRESH_TOKEN_REPOSITORY } from './repositories/refresh-token.repository.interface';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { AuthLoginService } from './services/auth-login.service';
import { AuthLogoutService } from './services/auth-logout.service';
import { AuthRefreshSessionService } from './services/auth-refresh-session.service';
import { AuthResponseMapperService } from './services/auth-response-mapper.service';
import { AuthTokenService } from './services/auth-token.service';
import { JwtStrategy } from './strategies/jwt.strategy';

/**
 * Módulo de autenticação interna (JWT RS256 com refresh rotacionado).
 *
 * - `JwtAuthGuard` e `RolesGuard` são exportados para que outros módulos
 *   apliquem via `@UseGuards(JwtAuthGuard, RolesGuard)`. Não estão
 *   registrados globalmente nesta PR — adoção é opt-in.
 * - `JwtModule.registerAsync` evita ler `JWT_SECRET_*` no momento da
 *   importação (importante para testes que mockam env via `ConfigModule`).
 * - `PassportModule.register({ defaultStrategy: 'jwt' })` torna o
 *   `AuthGuard('jwt')` (usado por `JwtAuthGuard`) válido sem prefixo.
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        // Chaves e TTLs reais são passados em cada `sign`/`verify` no
        // `AuthTokenService` — aqui só registramos o módulo.
        signOptions: {},
      }),
    }),
  ],
  controllers: [
    LoginController,
    RefreshSessionController,
    LogoutController,
    MeController,
  ],
  providers: [
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    AuthTokenService,
    AuthLoginService,
    AuthRefreshSessionService,
    AuthLogoutService,
    AuthResponseMapperService,
    {
      provide: REFRESH_TOKEN_REPOSITORY,
      useClass: RefreshTokenRepository,
    },
  ],
  exports: [JwtAuthGuard, RolesGuard, AuthTokenService],
})
export class AuthModule {}
