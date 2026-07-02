import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { httpError } from '@/common/exceptions/http-error.util';

/**
 * Valida `startDate <= endDate` quando ambos presentes; lança `VALIDATION_FAILED`.
 */
export function assertContactDateRangeValid(
  startDate: string | undefined,
  endDate: string | undefined,
  errorMessageService: ErrorMessageService,
): void {
  if (!startDate || !endDate) {
    return;
  }
  if (startDate > endDate) {
    throw httpError(
      errorMessageService,
      ErrorCode.VALIDATION_FAILED,
      HttpStatus.BAD_REQUEST,
      { DETAILS: 'startDate deve ser menor ou igual a endDate' },
    );
  }
}
