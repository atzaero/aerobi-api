import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import type { Token } from '@/generated/prisma/client';
import type { TokenType } from '@/generated/prisma/enums';

import type { ITokenRepository } from '../repositories/token.repository.interface';
import { TOKEN_REPOSITORY } from '../repositories/token.repository.interface';

import { TokenGenerationService } from './token-generation.service';

/**
 * Valida tokens plain contra o registro persistido (hash bcrypt) e trata
 * expiração / uso. Erros de validação viram `CustomHttpException` com o
 * `ErrorCode` apropriado — o `AllExceptionsFilter` expõe o código ao cliente.
 *
 * Cenários de erro:
 * - Token não encontrado para o `(subjectId, type)`            → `INVALID_TOKEN`
 * - Token encontrado mas hash bcrypt não bate com o plain     → `INVALID_TOKEN`
 * - Token expirado (`expiresAt <= now`)                       → `TOKEN_EXPIRED`
 * - Token já consumido (`used === true`)                      → `TOKEN_ALREADY_USED`
 *
 * Observação: `findActiveBySubjectAndType` já filtra `used` e `expiresAt`,
 * portanto o fluxo normal encontra um registro elegível. Os ramos de
 * expiração / uso são verificados defensivamente e úteis em testes.
 */
@Injectable()
export class TokenValidationService {
  private readonly logger = new Logger(TokenValidationService.name);

  constructor(
    @Inject(TOKEN_REPOSITORY)
    private readonly tokenRepository: ITokenRepository,
    private readonly tokenGeneration: TokenGenerationService,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  /**
   * Valida um token plain para o par `(subjectId, type)`. Retorna o registro
   * se válido, ou lança `CustomHttpException` com o `ErrorCode` adequado.
   */
  async validate(
    plainToken: string,
    subjectId: string,
    type: TokenType,
  ): Promise<Token> {
    const tokenRecord = await this.tokenRepository.findActiveBySubjectAndType(
      subjectId,
      type,
    );

    if (!tokenRecord) {
      this.logger.warn(
        `Token not found for subjectId=${subjectId} type=${type}`,
      );
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.INVALID_TOKEN),
        HttpStatus.BAD_REQUEST,
        ErrorCode.INVALID_TOKEN,
      );
    }

    const matches = await this.tokenGeneration.compareToken(
      plainToken,
      tokenRecord.tokenHash,
    );

    if (!matches) {
      this.logger.warn(
        `Token hash mismatch for subjectId=${subjectId} type=${type}`,
      );
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.INVALID_TOKEN),
        HttpStatus.BAD_REQUEST,
        ErrorCode.INVALID_TOKEN,
      );
    }

    if (tokenRecord.expiresAt.getTime() <= Date.now()) {
      this.logger.warn(
        `Token expired subjectId=${subjectId} type=${type} expiresAt=${tokenRecord.expiresAt.toISOString()}`,
      );
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.TOKEN_EXPIRED, {
          EXPIRED_AT: tokenRecord.expiresAt.toISOString(),
        }),
        HttpStatus.BAD_REQUEST,
        ErrorCode.TOKEN_EXPIRED,
      );
    }

    if (tokenRecord.used) {
      this.logger.warn(
        `Token already used subjectId=${subjectId} type=${type}`,
      );
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.TOKEN_ALREADY_USED),
        HttpStatus.BAD_REQUEST,
        ErrorCode.TOKEN_ALREADY_USED,
      );
    }

    return tokenRecord;
  }

  /** Marca um token como usado (one-shot). */
  async markAsUsed(id: string, updatedBy?: string): Promise<Token> {
    return this.tokenRepository.markAsUsed(id, updatedBy);
  }
}
