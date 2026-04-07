import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isAxiosError } from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { firstValueFrom } from 'rxjs';

const BASE_URLS = [
  'https://aisweb.decea.mil.br/api/',
  'http://aisweb.decea.gov.br/api/',
] as const;

/**
 * Serviço compartilhado para chamadas à API AISWEB (DECEA).
 *
 * Gerencia credenciais `AISWEB_API_KEY` e `AISWEB_API_PASS` internamente —
 * o cliente nunca precisa enviá-las.
 */
@Injectable()
export class AiswebHttpService {
  private readonly logger = new Logger(AiswebHttpService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  getApiKey(): string {
    const key = this.config.get<string>('AISWEB_API_KEY', '')?.trim();
    if (!key) {
      throw new ServiceUnavailableException('AISWEB_API_KEY não configurada');
    }
    return key;
  }

  getApiPass(): string {
    const pass = this.config.get<string>('AISWEB_API_PASS', '')?.trim();
    if (!pass) {
      throw new ServiceUnavailableException('AISWEB_API_PASS não configurada');
    }
    return pass;
  }

  /**
   * Tenta as URLs base em sequência e retorna o texto da primeira resposta 2xx.
   * Lança BadGatewayException se nenhuma URL responder com sucesso.
   */
  async fetchWithFallback(pathSuffix: string): Promise<string> {
    let lastError: unknown;

    for (const base of BASE_URLS) {
      const url = `${base}?${pathSuffix}`;
      try {
        const response = await firstValueFrom(
          this.http.get<string>(url, {
            responseType: 'text',
            validateStatus: () => true,
          }),
        );

        if (response.status >= 200 && response.status < 300) {
          return typeof response.data === 'string'
            ? response.data
            : String(response.data);
        }

        this.logger.warn(`AISWEB ${base} retornou status ${response.status}`);
        lastError = new Error(`HTTP ${response.status}`);
      } catch (err) {
        if (isAxiosError(err)) {
          this.logger.warn(`AISWEB ${base} falhou: ${err.message}`);
        } else {
          this.logger.warn(`AISWEB ${base} erro inesperado`);
        }
        lastError = err;
      }
    }

    this.logger.error(
      `Todas as URLs AISWEB falharam. Último erro: ${String(lastError)}`,
    );
    throw new BadGatewayException('Falha ao conectar na API AISWEB (DECEA)');
  }

  parseXml(text: string): unknown {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      cdataPropName: '#text',
      textNodeName: '#text',
      parseAttributeValue: false,
      parseTagValue: false,
    });
    return parser.parse(text);
  }

  buildQueryString(
    params: Record<string, string | number | undefined>,
  ): string {
    const parts: string[] = [];
    for (const [key, value] of Object.entries(params)) {
      if (value == null || value === '') continue;
      parts.push(
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
      );
    }
    return parts.join('&');
  }
}
