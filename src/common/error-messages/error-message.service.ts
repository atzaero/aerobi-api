import { Injectable, Logger } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { messages } from '@/common/error-messages/error-messages';

/**
 * Resolve mensagens humanas a partir de um `ErrorCode`, substituindo
 * placeholders `[CHAVE]` pelos valores informados em `params`.
 *
 * O serviço é registrado no `ErrorMessageModule` com `@Global()`, portanto pode
 * ser injetado em qualquer módulo sem imports adicionais.
 *
 * @example
 * ```ts
 * const msg = errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
 *   RESOURCE: 'Aerodromo',
 *   ID: 'abc-123',
 * });
 * // → "Recurso Aerodromo com identificador abc-123 não encontrado."
 * ```
 */
@Injectable()
export class ErrorMessageService {
  private readonly logger = new Logger(ErrorMessageService.name);
  private readonly messages = messages;

  /**
   * Retorna a mensagem associada ao `code`, com placeholders resolvidos.
   *
   * Se `code` não estiver mapeado, loga um warning e devolve uma mensagem
   * genérica — nunca lança, para não mascarar o erro original em handlers.
   */
  getMessage(
    code: ErrorCode,
    params?: Record<string, string | number>,
  ): string {
    const entry = this.messages[code];

    if (!entry) {
      this.logger.warn(
        `No message mapping found for ErrorCode=${code}; returning generic fallback`,
      );
      return 'Ocorreu um erro inesperado.';
    }

    let message = entry.message;

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        message = message.replace(`[${key}]`, String(value));
      }
    }

    return message;
  }
}
