import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  HttpException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isAxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

export type PlugfieldHttpRequestOptions = {
  readonly method: 'GET' | 'POST';
  readonly path: string;
  readonly query?: Record<string, string | number | undefined>;
  readonly body?: unknown;
  /**
   * When false, do not send Authorization to Plugfield (e.g. POST /login).
   */
  readonly useVendorAuthorization: boolean;
  /** Optional Authorization header from the incoming Aerobi client request. */
  readonly incomingAuthorization?: string | undefined;
};

/**
 * HTTP client for Plugfield vendor API (`prod-api.plugfield.com.br`).
 *
 * **Environment**
 * - `PLUGFIELD_VENDOR_API_KEY` — sent as `x-api-key` (required for outbound calls).
 * - `PLUGFIELD_API_BASE_URL` — default `https://prod-api.plugfield.com.br`.
 * - `PLUGFIELD_VENDOR_AUTHORIZATION` — optional default Bearer/token when client does not pass `Authorization`.
 */
@Injectable()
export class PlugfieldHttpService {
  private readonly logger = new Logger(PlugfieldHttpService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  getBaseUrl(): string {
    const raw =
      this.config.get<string>('PLUGFIELD_API_BASE_URL') ??
      'https://prod-api.plugfield.com.br';
    return raw.replace(/\/$/, '');
  }

  getVendorApiKey(): string {
    const key = this.config.get<string>('PLUGFIELD_VENDOR_API_KEY', '')?.trim();
    if (!key) {
      throw new ServiceUnavailableException(
        'Plugfield vendor API key not configured (PLUGFIELD_VENDOR_API_KEY)',
      );
    }
    return key;
  }

  /**
   * Performs a request to Plugfield and returns parsed JSON body.
   */
  async requestJson(options: PlugfieldHttpRequestOptions): Promise<unknown> {
    const vendorKey = this.getVendorApiKey();
    const base = this.getBaseUrl();
    const path = options.path.startsWith('/')
      ? options.path
      : `/${options.path}`;
    const url = `${base}${path}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': vendorKey,
    };

    if (options.useVendorAuthorization) {
      const authHeader = this.resolveAuthorizationHeader(
        options.incomingAuthorization,
      );
      if (authHeader) {
        headers['Authorization'] = authHeader;
      }
    }

    const params = this.buildAxiosParams(options.query);

    try {
      const response = await firstValueFrom(
        this.http.request<unknown>({
          method: options.method,
          url,
          headers,
          params,
          data:
            options.body !== undefined && options.method === 'POST'
              ? options.body
              : undefined,
          validateStatus: () => true,
        }),
      );

      const status = response.status;
      let data: unknown = response.data;

      if (typeof data === 'string') {
        try {
          data = JSON.parse(data) as unknown;
        } catch {
          this.logger.warn(`Plugfield non-JSON response status=${status}`);
          throw new BadGatewayException(
            'Plugfield returned a non-JSON response',
          );
        }
      }

      if (status >= 200 && status < 300) {
        return data;
      }

      this.throwForErrorStatus(status, data);
    } catch (err) {
      if (err instanceof BadGatewayException) {
        throw err;
      }
      if (err instanceof ServiceUnavailableException) {
        throw err;
      }
      if (isAxiosError(err)) {
        this.logger.error(
          `Plugfield request failed: ${err.message}`,
          err.stack,
        );
        throw new BadGatewayException('Failed to reach Plugfield API');
      }
      throw err;
    }
  }

  private resolveAuthorizationHeader(
    incomingAuthorization: string | undefined,
  ): string | undefined {
    const fromRequest = incomingAuthorization?.trim();
    if (fromRequest) {
      return fromRequest;
    }
    const fromEnv = this.config
      .get<string>('PLUGFIELD_VENDOR_AUTHORIZATION', '')
      ?.trim();
    return fromEnv || undefined;
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

  private throwForErrorStatus(status: number, body: unknown): never {
    if (status >= 400 && status < 500) {
      throw new HttpException(
        typeof body === 'object' && body !== null
          ? body
          : { message: `Plugfield client error (${status})` },
        status,
      );
    }
    throw new BadGatewayException({
      message: 'Plugfield upstream error',
      plugfieldStatus: status,
      plugfieldResponse: body,
    });
  }
}
