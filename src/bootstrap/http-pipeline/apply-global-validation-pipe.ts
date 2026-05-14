import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';

/**
 * `transform: true` aciona os `@Transform` (TrimString, NormalizeEmail, etc).
 * `whitelist: true` remove propriedades não declaradas nos DTOs antes de
 * chegar nos services — defesa contra mass-assignment.
 */
export function applyGlobalValidationPipe(app: NestExpressApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
}
