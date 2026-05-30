import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isAxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

const SERVICE_NAME = 'AviaScan';

export type AviascanHttpRequestOptions = {
  readonly method: 'GET';
  readonly path: string;
  readonly query?: Record<string, string | number | undefined>;
};

/**
 * HTTP client for the AviaScan vendor API (`aviascanapi.lmpierin.com.br`).
 *
 * Falhas de upstream são normalizadas para `CustomHttpException` com
 * `ErrorCode.EXTERNAL_SERVICE_FAILED`, para que o `AllExceptionsFilter` exponha
 * um payload consistente com código estável.
 *
 * **Environment**
 * - `AVIASCAN_API_BASE_URL` — default `https://aviascanapi.lmpierin.com.br`.
 * - `AVIASCAN_HTTP_TIMEOUT_MS` — HTTP timeout (default `8000`, configured in the module).
 */
@Injectable()
export class AviascanHttpService {
  private readonly logger = new Logger(AviascanHttpService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  getBaseUrl(): string {
    const raw =
      this.config.get<string>('AVIASCAN_API_BASE_URL') ??
      'https://aviascanapi.lmpierin.com.br';
    return raw.replace(/\/$/, '');
  }

  /**
   * Performs a request to AviaScan and returns the parsed JSON body.
   */
  async requestJson(options: AviascanHttpRequestOptions): Promise<unknown> {
    const base = this.getBaseUrl();
    const path = options.path.startsWith('/')
      ? options.path
      : `/${options.path}`;
    const url = `${base}${path}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const params = this.buildAxiosParams(options.query);

    try {
      const response = await firstValueFrom(
        this.http.request<unknown>({
          method: options.method,
          url,
          headers,
          params,
          validateStatus: () => true,
        }),
      );

      const status = response.status;
      let data: unknown = response.data;

      if (typeof data === 'string') {
        try {
          data = JSON.parse(data) as unknown;
        } catch {
          this.logger.warn(`AviaScan non-JSON response status=${status}`);
          throw this.upstreamException(HttpStatus.BAD_GATEWAY);
        }
      }

      if (status >= 200 && status < 300) {
        return data;
      }

      throw this.buildErrorStatusException(status);
    } catch (err) {
      if (err instanceof CustomHttpException) {
        throw err;
      }
      if (isAxiosError(err)) {
        this.logger.error(`AviaScan request failed: ${err.message}`, err.stack);
        throw this.upstreamException(HttpStatus.BAD_GATEWAY);
      }
      throw err;
    }
  }

  private buildAxiosParams(
    query: Record<string, string | number | undefined> | undefined,
  ): Record<string, string> | undefined {
    if (!query) {
      return undefined;
    }
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === '') {
        continue;
      }
      out[k] = typeof v === 'number' ? String(v) : v;
    }
    return Object.keys(out).length > 0 ? out : undefined;
  }

  private buildErrorStatusException(status: number): CustomHttpException {
    this.logger.warn(`AviaScan upstream error status=${status}`);
    // Repassa o status do upstream em 4xx; demais falhas viram 502.
    const outStatus =
      status >= 400 && status < 500 ? status : HttpStatus.BAD_GATEWAY;
    return this.upstreamException(outStatus);
  }

  private upstreamException(status: HttpStatus): CustomHttpException {
    return new CustomHttpException(
      this.errorMessageService.getMessage(ErrorCode.EXTERNAL_SERVICE_FAILED, {
        SERVICE: SERVICE_NAME,
      }),
      status,
      ErrorCode.EXTERNAL_SERVICE_FAILED,
    );
  }
}
