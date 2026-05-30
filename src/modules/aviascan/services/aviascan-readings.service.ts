import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Cache } from 'cache-manager';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import type {
  AviascanReadingsPaginatedResponse,
  AviascanReadingsQuery,
} from '../types/aviascan.types';
import { buildAviascanReadingsCacheKey } from '../utils/build-aviascan-cache-key.util';
import {
  isAviascanReadingsEnvelope,
  mapAviascanReadings,
} from '../utils/normalize-aviascan-readings.util';
import { AviascanHttpService } from './aviascan-http.service';

/** TTL default do cache de leituras (ms) quando `AVIASCAN_CACHE_TTL_MS` não é definido. */
const DEFAULT_CACHE_TTL_MS = 60_000;

/**
 * Proxy AviaScan `GET /api/readings/paginated`.
 *
 * Encaminha paginação (`page`/`limit`) e filtros (`registration`, `aerodrome`,
 * `start_date`, `end_date`) para o upstream, completa o `image_path` para URL
 * absoluta e devolve o envelope `{ data, meta }`.
 *
 * **Cache:** a resposta (já mapeada) é cacheada in-memory por chave derivada da
 * query (ver {@link buildAviascanReadingsCacheKey}). TTL configurável via
 * `AVIASCAN_CACHE_TTL_MS` (default `60000` = 60s). Hit retorna do cache; miss
 * busca no upstream e grava.
 */
@Injectable()
export class AviascanReadingsService {
  private readonly logger = new Logger(AviascanReadingsService.name);

  constructor(
    private readonly aviascanHttp: AviascanHttpService,
    private readonly errorMessageService: ErrorMessageService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly config: ConfigService,
  ) {}

  async execute(
    query: AviascanReadingsQuery,
  ): Promise<AviascanReadingsPaginatedResponse> {
    const cacheKey = buildAviascanReadingsCacheKey(query);

    const cached = await this.readCache(cacheKey);
    if (cached != null) {
      return cached;
    }

    const raw = await this.aviascanHttp.requestJson({
      method: 'GET',
      path: '/api/readings/paginated',
      query: {
        page: query.page ?? 1,
        limit: query.limit ?? 10,
        registration: query.registration,
        aerodrome: query.aerodrome,
        start_date: query.start_date,
        end_date: query.end_date,
      },
    });

    if (!isAviascanReadingsEnvelope(raw)) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.EXTERNAL_SERVICE_FAILED, {
          SERVICE: 'AviaScan',
        }),
        HttpStatus.BAD_GATEWAY,
        ErrorCode.EXTERNAL_SERVICE_FAILED,
      );
    }

    const result = mapAviascanReadings(raw, this.aviascanHttp.getBaseUrl());
    await this.writeCache(cacheKey, result);
    return result;
  }

  /**
   * Lê do cache de forma resiliente: uma falha no store (ex. futuro Redis
   * indisponível) degrada para miss em vez de derrubar a requisição.
   */
  private async readCache(
    cacheKey: string,
  ): Promise<AviascanReadingsPaginatedResponse | undefined> {
    try {
      return await this.cache.get<AviascanReadingsPaginatedResponse>(cacheKey);
    } catch (err) {
      this.logger.warn(
        `AviaScan cache get failed for "${cacheKey}": ${String(err)}`,
      );
      return undefined;
    }
  }

  /**
   * Grava no cache de forma resiliente: uma falha no store não deve impedir a
   * devolução do resultado já obtido do upstream.
   */
  private async writeCache(
    cacheKey: string,
    value: AviascanReadingsPaginatedResponse,
  ): Promise<void> {
    try {
      await this.cache.set(cacheKey, value, this.resolveCacheTtlMs());
    } catch (err) {
      this.logger.warn(
        `AviaScan cache set failed for "${cacheKey}": ${String(err)}`,
      );
    }
  }

  /** Resolve o TTL do cache (ms) a partir de `AVIASCAN_CACHE_TTL_MS`. */
  private resolveCacheTtlMs(): number {
    const raw = this.config.get<string | number>(
      'AVIASCAN_CACHE_TTL_MS',
      DEFAULT_CACHE_TTL_MS,
    );
    const parsed = typeof raw === 'number' ? raw : parseInt(String(raw), 10);
    return Number.isFinite(parsed) && parsed > 0
      ? parsed
      : DEFAULT_CACHE_TTL_MS;
  }
}
