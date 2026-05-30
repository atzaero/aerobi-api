import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import type {
  AviascanReadingsPaginatedResponse,
  AviascanReadingsQuery,
} from '../types/aviascan.types';
import {
  isAviascanReadingsEnvelope,
  mapAviascanReadings,
} from '../utils/normalize-aviascan-readings.util';
import { AviascanHttpService } from './aviascan-http.service';

/**
 * Proxy AviaScan `GET /api/readings/paginated`.
 *
 * Encaminha paginação (`page`/`limit`) e filtros (`registration`, `aerodrome`,
 * `start_date`, `end_date`) para o upstream, completa o `image_path` para URL
 * absoluta e devolve o envelope `{ data, meta }`.
 */
@Injectable()
export class AviascanReadingsService {
  constructor(
    private readonly aviascanHttp: AviascanHttpService,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    query: AviascanReadingsQuery,
  ): Promise<AviascanReadingsPaginatedResponse> {
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

    return mapAviascanReadings(raw, this.aviascanHttp.getBaseUrl());
  }
}
