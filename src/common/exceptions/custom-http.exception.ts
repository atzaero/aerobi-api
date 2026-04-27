import { HttpException, HttpStatus } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';

/**
 * Exceção HTTP da Aerobi que, além da mensagem e do status, transporta um
 * `ErrorCode` estável no payload — permitindo que o `AllExceptionsFilter`
 * exponha o código ao cliente de forma consistente.
 *
 * @example
 * ```ts
 * throw new CustomHttpException(
 *   errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, { RESOURCE: 'Aerodromo', ID: id }),
 *   HttpStatus.NOT_FOUND,
 *   ErrorCode.RESOURCE_NOT_FOUND,
 * );
 * ```
 */
export class CustomHttpException extends HttpException {
  private readonly errorCode: ErrorCode;

  constructor(message: string, status: HttpStatus, errorCode: ErrorCode) {
    super(
      {
        message,
        statusCode: status,
        errorCode,
      },
      status,
    );
    this.errorCode = errorCode;
  }

  /** `ErrorCode` associado a esta exceção. */
  getErrorCode(): ErrorCode {
    return this.errorCode;
  }
}
