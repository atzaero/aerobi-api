import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { httpError } from '@/common/exceptions/http-error.util';
import { AuditAction } from '@/generated/prisma/client';
import { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { RecordAuditContext } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { PasswordResetResponseDto } from '../dtos/password-reset-response.dto';
import { UserRepository } from '../repositories/user.repository';
import { RequestPasswordResetService } from './request-password-reset.service';

/**
 * Reset de senha disparado por um administrador (`POST /users/:id/password-reset`).
 * Difere do `reset-password` do `aerobi-web` (que gera senha e a envia por email):
 * por segurança, dispara um **link de redefinição** reusando o fluxo de token do
 * self-service (`RequestPasswordResetService`) — nunca trafega senha em claro.
 *
 * Gated por `@RequirePermission('user','update')` (ADMIN). Usuário inexistente ⇒
 * `USER_NOT_FOUND`. Usuário com convite ainda pendente não recebe link (não há
 * senha a redefinir) — esse recorte é herdado do `RequestPasswordResetService`.
 */
@Injectable()
export class AdminResetPasswordService {
  private readonly logger = new Logger(AdminResetPasswordService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly requestPasswordResetService: RequestPasswordResetService,
    private readonly errorMessageService: ErrorMessageService,
    private readonly auditRecorder: AuditRecorderService,
  ) {}

  async execute(
    id: string,
    actor: AuthenticatedUser,
    auditContext: RecordAuditContext = {},
  ): Promise<PasswordResetResponseDto> {
    const user = await this.userRepository.findActiveById(id);
    if (!user) {
      throw httpError(
        this.errorMessageService,
        ErrorCode.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { ID: id },
      );
    }

    this.logger.log(
      `Admin password reset triggered targetUserId=${id} by=${actor.id}`,
    );

    /**
     * Sub-operação modelada como UPDATE + `metadata.scope` (paridade com o web):
     * a ação não altera colunas snapshotáveis (dispara um link), então sem
     * `before`/`after` — só o marcador de escopo.
     */
    await this.auditRecorder.record(
      {
        action: AuditAction.UPDATE,
        entityType: 'user',
        entityId: id,
        metadata: { scope: 'reset-password' },
      },
      auditContext,
    );

    return this.requestPasswordResetService.execute({ email: user.email });
  }
}
