import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Shape da resposta de erro emitida pelo filtro.
 *
 * O campo `errorCode` só aparece quando a exceção o expõe (ex. instâncias de
 * `CustomHttpException`). Dessa forma mantemos 100% de compatibilidade com as
 * `HttpException` padrão do Nest, que continuam produzindo respostas sem
 * `errorCode`.
 */
interface ErrorResponsePayload {
  statusCode: number;
  message: string;
  error: string;
  errorCode?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const errorResponse = exception.getResponse();

      let message: string;
      let errorCode: string | undefined;

      if (typeof errorResponse === 'object' && errorResponse !== null) {
        const o = errorResponse as {
          message?: string | string[];
          errorCode?: string;
        };
        message = Array.isArray(o.message)
          ? o.message.join(', ')
          : (o.message ?? exception.message);
        errorCode = o.errorCode;
      } else {
        message = String(errorResponse);
      }

      const payload: ErrorResponsePayload = {
        statusCode: status,
        message,
        error: HttpStatus[status],
      };
      if (errorCode) {
        payload.errorCode = errorCode;
      }

      response.status(status).json(payload);
      return;
    }

    this.logger.error(exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
    });
  }
}
