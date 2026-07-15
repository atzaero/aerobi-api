import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import bcrypt from 'bcryptjs';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { getErrorMessage } from '@/common/utils/error.util';
import { maskEmail } from '@/common/utils/mask-email.util';
import type { UserRole } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type {
  IssuedTokenPair,
  SessionContext,
} from '../interfaces/auth-token.types';

import { IssueTokenPairService } from './issue-token-pair.service';

export interface LoginInput {
  email: string;
  password: string;
  context?: SessionContext;
}

export interface LoginResult extends IssuedTokenPair {
  user: { id: string; email: string; name: string; role: UserRole };
}

/**
 * Caso de uso: login com email + senha. Emite um par fresco (access +
 * refresh) e atualiza `last_login_at`.
 *
 * Validações:
 *  - Usuário existe e não está soft-deleted
 *  - `password` no DB não é null (`ACCOUNT_NOT_ACTIVATED` — convite ainda
 *    não foi aceito)
 *  - bcrypt do plain bate com o hash armazenado
 *  - `email_verified === true`
 *
 * Mensagem genérica (`INVALID_CREDENTIALS`) é usada para email não
 * encontrado E senha errada — evita user enumeration. Estados específicos
 * (não ativado / não verificado / deletado) recebem códigos próprios
 * porque o frontend precisa orientar o usuário.
 *
 * **Nota**: PR 2 acessa `PrismaService` diretamente para reads de `User`.
 * O PR 3 (módulo `users/`) introduz `IUserRepository` e este service
 * será refatorado para usá-lo.
 */
@Injectable()
export class AuthLoginService {
  private readonly logger = new Logger(AuthLoginService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly issueTokenPair: IssueTokenPairService,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute({
    email,
    password,
    context,
  }: LoginInput): Promise<LoginResult> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        emailVerified: true,
        deletedAt: true,
      },
    });

    if (!user || user.deletedAt) {
      this.logger.debug(
        `Login failed — user not found or deleted email=${maskEmail(email)}`,
      );
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.INVALID_CREDENTIALS),
        HttpStatus.UNAUTHORIZED,
        ErrorCode.INVALID_CREDENTIALS,
      );
    }

    if (user.password === null) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.ACCOUNT_NOT_ACTIVATED),
        HttpStatus.UNAUTHORIZED,
        ErrorCode.ACCOUNT_NOT_ACTIVATED,
      );
    }

    const passwordOk = await bcrypt.compare(password, user.password);
    if (!passwordOk) {
      this.logger.debug(`Login failed — wrong password userId=${user.id}`);
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.INVALID_CREDENTIALS),
        HttpStatus.UNAUTHORIZED,
        ErrorCode.INVALID_CREDENTIALS,
      );
    }

    if (!user.emailVerified) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.ACCOUNT_NOT_VERIFIED),
        HttpStatus.UNAUTHORIZED,
        ErrorCode.ACCOUNT_NOT_VERIFIED,
      );
    }

    const pair = await this.issueTokenPair.execute(
      { id: user.id, email: user.email, role: user.role },
      context,
    );

    // Não bloqueia a resposta se `lastLoginAt` falhar (audit-only).
    this.prisma.user
      .update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
        select: { id: true },
      })
      .catch((err: unknown) => {
        this.logger.warn(
          `Failed to update lastLoginAt userId=${user.id} err=${getErrorMessage(
            err,
          )}`,
        );
      });

    this.logger.log(
      `Login OK userId=${user.id} email=${maskEmail(user.email)}`,
    );

    return {
      ...pair,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
