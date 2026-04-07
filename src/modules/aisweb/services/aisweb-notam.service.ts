import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';

import { NotamQueryDto } from '../dtos/notam-query.dto';
import { NotamResponseDto } from '../dtos/notam-response.dto';
import {
  ParsedNotamXml,
  normalizeNotamItems,
} from '../utils/notam-xml-normalize.util';
import { AiswebHttpService } from './aisweb-http.service';

@Injectable()
export class AiswebNotamService {
  private readonly logger = new Logger(AiswebNotamService.name);

  constructor(private readonly aiswebHttp: AiswebHttpService) {}

  async execute(query: NotamQueryDto): Promise<NotamResponseDto> {
    const apiKey = this.aiswebHttp.getApiKey();
    const apiPass = this.aiswebHttp.getApiPass();

    const qs = this.aiswebHttp.buildQueryString({
      apiKey,
      apiPass,
      area: 'notam',
      dist: query.dist,
      nof: query.nof,
      serie: query.serie,
      categoria: query.categoria,
      status: query.status,
      fir: query.fir,
      nnotam: query.nnotam,
      ano: query.ano,
      dt_ref: query.dt_ref,
      dt: query.dt,
      all: query.all,
      minutes: query.minutes,
      dt_start: query.dt_start,
      dt_end: query.dt_end,
      icaocode: query.icaocode,
      type: query.type,
    });

    const text = await this.aiswebHttp.fetchWithFallback(qs);

    let parsed: unknown;
    try {
      parsed = this.aiswebHttp.parseXml(text);
    } catch (err) {
      this.logger.error(`Falha ao parsear XML notam: ${String(err)}`);
      throw new UnprocessableEntityException(
        'Resposta inválida da API AISWEB (notam)',
      );
    }

    const { total, updatedat, rawItems } = normalizeNotamItems(
      parsed as ParsedNotamXml,
    );

    return {
      total,
      updatedat,
      items: rawItems as NotamResponseDto['items'],
    };
  }
}
