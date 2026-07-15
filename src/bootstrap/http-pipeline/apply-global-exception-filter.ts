import type { NestExpressApplication } from '@nestjs/platform-express';

import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';

/** Registra o filter global que normaliza erros em payload com `errorCode`. */
export function applyGlobalExceptionFilter(app: NestExpressApplication): void {
  app.useGlobalFilters(new AllExceptionsFilter());
}
