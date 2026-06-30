import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';

import { CustomHttpException } from './custom-http.exception';
import { httpError } from './http-error.util';

describe('httpError', () => {
  const errorMessages = new ErrorMessageService();

  it('cria um CustomHttpException com o status e o errorCode informados', () => {
    const ex = httpError(
      errorMessages,
      ErrorCode.FORBIDDEN,
      HttpStatus.FORBIDDEN,
    );

    expect(ex).toBeInstanceOf(CustomHttpException);
    expect(ex.getStatus()).toBe(HttpStatus.FORBIDDEN);
    expect(ex.getErrorCode()).toBe(ErrorCode.FORBIDDEN);
  });

  it('resolve a mensagem com os placeholders dos params', () => {
    const ex = httpError(
      errorMessages,
      ErrorCode.USER_NOT_FOUND,
      HttpStatus.NOT_FOUND,
      { ID: 'abc-123' },
    );
    const body = ex.getResponse() as { message: string; errorCode: ErrorCode };

    expect(body.errorCode).toBe(ErrorCode.USER_NOT_FOUND);
    expect(body.message).toContain('abc-123');
  });
});
