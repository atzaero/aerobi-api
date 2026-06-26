import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

/**
 * Monta a `CustomHttpException` padrão de recurso inexistente (404
 * `RESOURCE_NOT_FOUND`). Centraliza o `private notFound` antes copy-pasted nos
 * services de imagem e o bloco inline de find/update/remove.
 */
export function resourceNotFound(
  errorMessageService: ErrorMessageService,
  resource: string,
  id: string,
): CustomHttpException {
  return new CustomHttpException(
    errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
      RESOURCE: resource,
      ID: id,
    }),
    HttpStatus.NOT_FOUND,
    ErrorCode.RESOURCE_NOT_FOUND,
  );
}
