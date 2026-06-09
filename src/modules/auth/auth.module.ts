import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { LoginController } from './controllers/login.controller';
import { LogoutController } from './controllers/logout.controller';
import { MeController } from './controllers/me.controller';
import { RefreshSessionController } from './controllers/refresh-session.controller';
import { GroupScopeGuard } from './guards/group-scope.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RolesGuard } from './guards/roles.guard';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { AuthLoginService } from './services/auth-login.service';
import { AuthLogoutService } from './services/auth-logout.service';
import { AuthRefreshSessionService } from './services/auth-refresh-session.service';
import { AuthResponseMapperService } from './services/auth-response-mapper.service';
import { IssueTokenPairService } from './services/issue-token-pair.service';
import { JwtSignerService } from './services/jwt-signer.service';
import { JwtVerifierService } from './services/jwt-verifier.service';
import { RotateTokenPairService } from './services/rotate-token-pair.service';
import { JwtStrategy } from './strategies/jwt.strategy';

/**
 * Módulo de autenticação interna (JWT RS256 com refresh rotacionado).
 *
 * Responsabilidades dos providers (cada um com responsabilidade única):
 * - `JwtSignerService` — posse da private key (RS256), assina access/refresh.
 * - `JwtVerifierService` — posse da public key, valida refresh (access usa Passport).
 * - `IssueTokenPairService` — emite par fresco + persiste refresh (login / accept-invite).
 * - `RotateTokenPairService` — rotação atômica (refresh-session).
 * - `AuthLoginService` / `AuthRefreshSessionService` / `AuthLogoutService` —
 *   casos de uso que orquestram os primitivos acima.
 *
 * Exporta `JwtAuthGuard`, `RolesGuard`, `PermissionsGuard`, `GroupScopeGuard`
 * (para `@UseGuards` em outros módulos) e `IssueTokenPairService` (para que o
 * PR 3 emita par no aceite de convite).
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        // Chaves e TTLs reais são passados em cada `sign`/`verify` nos
        // services especializados — aqui só registramos o módulo.
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
    PermissionsGuard,
    GroupScopeGuard,
    JwtSignerService,
    JwtVerifierService,
    IssueTokenPairService,
    RotateTokenPairService,
    AuthLoginService,
    AuthRefreshSessionService,
    AuthLogoutService,
    AuthResponseMapperService,
    RefreshTokenRepository,
  ],
  // `RefreshTokenRepository` é exportado para que o `UsersModule` revogue
  // sessões em delete/password-reset. `IssueTokenPairService` para emitir
  // par no aceite de convite.
  exports: [
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    GroupScopeGuard,
    IssueTokenPairService,
    RefreshTokenRepository,
  ],
})
export class AuthModule {}
