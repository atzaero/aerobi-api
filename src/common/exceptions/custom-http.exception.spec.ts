import { HttpException, HttpStatus } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

describe('CustomHttpException', () => {
  it('é uma HttpException', () => {
    const exc = new CustomHttpException(
      'boom',
      HttpStatus.BAD_REQUEST,
      ErrorCode.VALIDATION_FAILED,
    );
    expect(exc).toBeInstanceOf(HttpException);
  });

  it('expõe status via getStatus()', () => {
    const exc = new CustomHttpException(
      'boom',
      HttpStatus.NOT_FOUND,
      ErrorCode.RESOURCE_NOT_FOUND,
    );
    expect(exc.getStatus()).toBe(HttpStatus.NOT_FOUND);
  });

  it('monta payload { message, statusCode, errorCode }', () => {
    const exc = new CustomHttpException(
      'Recurso nao encontrado',
      HttpStatus.NOT_FOUND,
      ErrorCode.RESOURCE_NOT_FOUND,
    );
    expect(exc.getResponse()).toEqual({
      message: 'Recurso nao encontrado',
      statusCode: HttpStatus.NOT_FOUND,
      errorCode: ErrorCode.RESOURCE_NOT_FOUND,
    });
  });

  it('getErrorCode() retorna o code fornecido', () => {
    const exc = new CustomHttpException(
      'conflito',
      HttpStatus.CONFLICT,
      ErrorCode.CONFLICT,
    );
    expect(exc.getErrorCode()).toBe(ErrorCode.CONFLICT);
  });

  it('propaga message original na propriedade .message', () => {
    const exc = new CustomHttpException(
      'mensagem humana',
      HttpStatus.UNAUTHORIZED,
      ErrorCode.UNAUTHORIZED,
    );
    expect(exc.message).toBe('mensagem humana');
  });
});
