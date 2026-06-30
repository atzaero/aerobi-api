import { Module } from '@nestjs/common';

import { EmailModule } from '@/common/email/email.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { TokensModule } from '@/modules/tokens/tokens.module';

import { AcceptInviteController } from './controllers/accept-invite.controller';
import { AdminResetPasswordController } from './controllers/admin-reset-password.controller';
import { ChangePasswordController } from './controllers/change-password.controller';
import { ConfirmPasswordResetController } from './controllers/confirm-password-reset.controller';
import { CreateUserController } from './controllers/create-user.controller';
import { ExportUsersController } from './controllers/export-users.controller';
import { FindUserByIdController } from './controllers/find-user-by-id.controller';
import { ListUsersController } from './controllers/list-users.controller';
import { RemoveUserController } from './controllers/remove-user.controller';
import { RequestPasswordResetController } from './controllers/request-password-reset.controller';
import { ResendInviteController } from './controllers/resend-invite.controller';
import { UpdateProfileController } from './controllers/update-profile.controller';
import { UpdateUserController } from './controllers/update-user.controller';
import { VerifyPasswordResetTokenController } from './controllers/verify-password-reset-token.controller';
import { InviteEmailListener } from './listeners/invite-email.listener';
import { PasswordResetEmailListener } from './listeners/password-reset-email.listener';
import { UserEmailChangedEmailListener } from './listeners/user-email-changed-email.listener';
import { UserRepository } from './repositories/user.repository';
import { AcceptInviteService } from './services/accept-invite.service';
import { AdminResetPasswordService } from './services/admin-reset-password.service';
import { ChangePasswordService } from './services/change-password.service';
import { ConfirmPasswordResetService } from './services/confirm-password-reset.service';
import { CreateUserService } from './services/create-user.service';
import { ExportUsersService } from './services/export-users.service';
import { FindUserByIdService } from './services/find-user-by-id.service';
import { ListUsersService } from './services/list-users.service';
import { RemoveUserService } from './services/remove-user.service';
import { RequestPasswordResetService } from './services/request-password-reset.service';
import { ResendInviteService } from './services/resend-invite.service';
import { UpdateProfileService } from './services/update-profile.service';
import { UpdateUserService } from './services/update-user.service';
import { VerifyPasswordResetTokenService } from './services/verify-password-reset-token.service';

/**
 * Módulo de usuários: CRUD protegido por RBAC, fluxo de convite
 * (consome `InviteTokenService` do `TokensModule` e `IssueTokenPairService`
 * do `AuthModule`) e redefinição de senha.
 *
 * Exporta `UserRepository` para outros módulos que precisem ler `User`
 * sem acoplar ao Prisma diretamente.
 */
@Module({
  imports: [AuthModule, TokensModule, EmailModule],
  controllers: [
    CreateUserController,
    ListUsersController,
    // Rotas estáticas `/users/me*` antes das paramétricas `/users/:id` para ter
    // precedência no roteamento.
    UpdateProfileController,
    ChangePasswordController,
    ExportUsersController,
    FindUserByIdController,
    UpdateUserController,
    RemoveUserController,
    AdminResetPasswordController,
    AcceptInviteController,
    ResendInviteController,
    RequestPasswordResetController,
    VerifyPasswordResetTokenController,
    ConfirmPasswordResetController,
  ],
  providers: [
    CreateUserService,
    ListUsersService,
    FindUserByIdService,
    ExportUsersService,
    UpdateProfileService,
    ChangePasswordService,
    UpdateUserService,
    RemoveUserService,
    AdminResetPasswordService,
    AcceptInviteService,
    ResendInviteService,
    RequestPasswordResetService,
    VerifyPasswordResetTokenService,
    ConfirmPasswordResetService,
    InviteEmailListener,
    PasswordResetEmailListener,
    UserEmailChangedEmailListener,
    UserRepository,
  ],
  exports: [UserRepository],
})
export class UsersModule {}
