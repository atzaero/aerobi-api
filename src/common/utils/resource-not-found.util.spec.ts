import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import { resourceNotFound } from './resource-not-found.util';

describe('resourceNotFound', () => {
  const errorMessageService = new ErrorMessageService();

  it('monta CustomHttpException 404 com ErrorCode RESOURCE_NOT_FOUND', () => {
    const ex = resourceNotFound(
      errorMessageService,
      'Grupo de aeródromos',
      'abc-123',
    );
    expect(ex).toBeInstanceOf(CustomHttpException);
    expect(ex.getStatus()).toBe(HttpStatus.NOT_FOUND);
    expect(ex.getErrorCode()).toBe(ErrorCode.RESOURCE_NOT_FOUND);
  });

  it('interpola RESOURCE e ID na mensagem', () => {
    const ex = resourceNotFound(errorMessageService, 'Imagem do grupo', 'g1');
    expect(ex.getResponse()).toMatchObject({
      message: 'Recurso Imagem do grupo com identificador g1 não encontrado.',
      errorCode: ErrorCode.RESOURCE_NOT_FOUND,
    });
  });
});
