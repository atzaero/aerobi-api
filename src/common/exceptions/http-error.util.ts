import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';

import { CustomHttpException } from './custom-http.exception';

/**
 * Factory de `CustomHttpException` a partir de um `ErrorCode`: resolve a
 * mensagem via `ErrorMessageService` e monta a exceção numa única chamada.
 *
 * Substitui o boilerplate de três linhas — e a duplicação do `ErrorCode` (que
 * aparecia tanto no `getMessage` quanto no construtor) — por uma chamada onde o
 * código aparece **uma vez**. Mantém o `errorCode` estável no payload (lido pelo
 * `AllExceptionsFilter`).
 *
 * @example
 * ```ts
 * throw httpError(this.errorMessageService, ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, {
 *   RESOURCE: 'user',
 * });
 * ```
 */
export function httpError(
  errorMessageService: ErrorMessageService,
  code: ErrorCode,
  status: HttpStatus,
  params?: Record<string, string | number>,
): CustomHttpException {
  return new CustomHttpException(
    errorMessageService.getMessage(code, params),
    status,
    code,
  );
}
