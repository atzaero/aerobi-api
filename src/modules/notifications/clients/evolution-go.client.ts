import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isAxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

import { toWhatsappNumber } from '../utils/phone.util';
import {
  WhatsappClient,
  WhatsappSendResult,
  WhatsappSendTextInput,
} from './whatsapp-client.port';
import { WhatsappSendError } from './whatsapp-send.error';

/**
 * Adapter da Evolution GO (Go/whatsmeow) para o {@link WhatsappClient}.
 *
 * É o **único** ponto que conhece a superfície da Evolution GO: base URL, header
 * de auth e formato do payload. Contrato confirmado no spike de provisionamento
 * (atzaero/aerobi-ansible#138 → `docs/EVOLUTION_GO.md`): envio em `POST /send/text`
 * com header `apikey` = **token da instância** e body `{ number, text }`. A
 * instância é identificada pelo token (não vai no path). O nome do header fica
 * configurável só por robustez (`EVOLUTION_GO_AUTH_HEADER`, default `apikey`).
 *
 * **Environment**
 * - `EVOLUTION_GO_BASE_URL` — base interna na rede warpgate (ex.: `http://evolution_go:4000`).
 * - `EVOLUTION_GO_API_KEY` — token da instância, enviado no header de auth.
 * - `EVOLUTION_GO_AUTH_HEADER` — nome do header de auth (default `apikey`).
 */
@Injectable()
export class EvolutionGoClient implements WhatsappClient {
  private readonly logger = new Logger(EvolutionGoClient.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async sendText(input: WhatsappSendTextInput): Promise<WhatsappSendResult> {
    const number = toWhatsappNumber(input.to);
    if (!number) {
      throw new WhatsappSendError(
        `Telefone inválido para envio de WhatsApp: "${input.to}"`,
        false,
      );
    }

    const url = `${this.getBaseUrl()}/send/text`;

    try {
      const response = await firstValueFrom(
        this.http.request<unknown>({
          method: 'POST',
          url,
          headers: {
            'Content-Type': 'application/json',
            [this.getAuthHeaderName()]: this.getApiKey(),
          },
          data: { number, text: input.text },
          validateStatus: () => true,
        }),
      );

      const status = response.status;
      if (status >= 200 && status < 300) {
        return { to: number, messageId: this.extractMessageId(response.data) };
      }

      throw new WhatsappSendError(
        `Evolution GO respondeu ${status} ao enviar para ${number}`,
        this.isRetryableStatus(status),
        status,
      );
    } catch (err) {
      if (err instanceof WhatsappSendError) {
        throw err;
      }
      if (isAxiosError(err)) {
        this.logger.error(
          `Falha de rede ao chamar Evolution GO: ${err.message}`,
        );
        throw new WhatsappSendError(
          `Falha de rede ao enviar WhatsApp para ${number}: ${err.message}`,
          true,
        );
      }
      throw err;
    }
  }

  private getBaseUrl(): string {
    const raw = this.config.get<string>('EVOLUTION_GO_BASE_URL', '')?.trim();
    if (!raw) {
      throw new ServiceUnavailableException(
        'Evolution GO não configurada (EVOLUTION_GO_BASE_URL)',
      );
    }
    return raw.replace(/\/$/, '');
  }

  private getApiKey(): string {
    const key = this.config.get<string>('EVOLUTION_GO_API_KEY', '')?.trim();
    if (!key) {
      throw new ServiceUnavailableException(
        'Evolution GO sem credencial (EVOLUTION_GO_API_KEY)',
      );
    }
    return key;
  }

  private getAuthHeaderName(): string {
    return (
      this.config.get<string>('EVOLUTION_GO_AUTH_HEADER', '')?.trim() ||
      'apikey'
    );
  }

  /** Falhas transitórias (rede já tratada à parte): 429 e 5xx valem retry. */
  private isRetryableStatus(status: number): boolean {
    return status === 429 || status >= 500;
  }

  /**
   * Extrai o id da mensagem da resposta de `POST /send/text`, cujo shape oficial
   * é `{ data: { Info: { ID } }, message }` (docs.evolutionfoundation.com.br).
   * Best-effort: devolve `null` se o formato mudar.
   */
  private extractMessageId(body: unknown): string | null {
    const data = this.asRecord(body)?.data;
    const info = this.asRecord(data)?.Info;
    const id = this.asRecord(info)?.ID;
    return typeof id === 'string' ? id : null;
  }

  private asRecord(value: unknown): Record<string, unknown> | null {
    return typeof value === 'object' && value !== null
      ? (value as Record<string, unknown>)
      : null;
  }
}
