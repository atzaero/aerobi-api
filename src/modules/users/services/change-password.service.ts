import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { RefreshTokenRepository } from '@/modules/auth/repositories/refresh-token.repository';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { ChangePasswordRequestDto } from '../dtos/change-password-request.dto';
import type { ChangePasswordResponseDto } from '../dtos/change-password-response.dto';
import { UserRepository } from '../repositories/user.repository';
import { comparePassword, hashPassword } from '../utils/password-hash.util';

/**
 * Troca de senha pelo próprio usuário (`POST /users/me/change-password`) —
 * espelha a parte de senha do `update-profile` do `aerobi-web`. Verifica a senha
 * atual (bcrypt) antes de gravar a nova e, por segurança, **revoga todas as
 * sessões** (o access token corrente expira sozinho; a próxima rotação falha,
 * forçando novo login). Senha atual incorreta ⇒ `INVALID_CREDENTIALS`.
 */
@Injectable()
export class ChangePasswordService {
  private readonly logger = new Logger(ChangePasswordService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    actor: AuthenticatedUser,
    dto: ChangePasswordRequestDto,
  ): Promise<ChangePasswordResponseDto> {
    const user = await this.userRepository.findActiveById(actor.id);

    /** Token válido mas conta soft-deletada (a JwtStrategy não revalida). */
    if (!user) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.ACCOUNT_DELETED),
        HttpStatus.UNAUTHORIZED,
        ErrorCode.ACCOUNT_DELETED,
      );
    }

    /**
     * Sem senha definida (convite ainda não aceito) não há o que verificar —
     * trata como credencial inválida em vez de aceitar a troca.
     */
    const matches =
      user.password !== null &&
      (await comparePassword(dto.currentPassword, user.password));
    if (!matches) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.INVALID_CREDENTIALS),
        HttpStatus.UNAUTHORIZED,
        ErrorCode.INVALID_CREDENTIALS,
      );
    }

    const passwordHash = await hashPassword(dto.newPassword);
    await this.userRepository.update(actor.id, {
      password: passwordHash,
      updatedBy: actor.id,
    });

    const revoked = await this.refreshTokenRepository.revokeAllForUser(
      actor.id,
    );

    this.logger.log(
      `Password changed by self id=${actor.id} revokedRefreshTokens=${revoked}`,
    );

    return { message: 'Senha alterada com sucesso.' };
  }
}
