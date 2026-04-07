import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';

import { SolQueryDto } from '../dtos/sol-query.dto';
import { SolDayDto, SolResponseDto } from '../dtos/sol-response.dto';
import { normalizeSolDays } from '../utils/sol-xml-normalize.util';
import { AiswebHttpService } from './aisweb-http.service';

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function unwrapString(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (
    typeof value === 'object' &&
    '#text' in (value as Record<string, unknown>)
  ) {
    return String((value as Record<string, unknown>)['#text'] ?? '');
  }
  return String(value);
}

@Injectable()
export class AiswebSolService {
  private readonly logger = new Logger(AiswebSolService.name);

  constructor(private readonly aiswebHttp: AiswebHttpService) {}

  async execute(query: SolQueryDto): Promise<SolResponseDto> {
    const apiKey = this.aiswebHttp.getApiKey();
    const apiPass = this.aiswebHttp.getApiPass();

    const today = formatDate(new Date());
    const dt_i = query.dt_i ?? today;
    const dt_f = query.dt_f ?? today;

    const qs = this.aiswebHttp.buildQueryString({
      apiKey,
      apiPass,
      area: 'sol',
      icaoCode: query.icaoCode,
      dt_i,
      dt_f,
    });

    const text = await this.aiswebHttp.fetchWithFallback(qs);

    let parsed: { aisweb?: { day?: unknown } };
    try {
      parsed = this.aiswebHttp.parseXml(text) as {
        aisweb?: { day?: unknown };
      };
    } catch (err) {
      this.logger.error(`Falha ao parsear XML sol: ${String(err)}`);
      throw new UnprocessableEntityException(
        'Resposta inválida da API AISWEB (sol)',
      );
    }

    const rawDays = normalizeSolDays(parsed);

    const days: SolDayDto[] = rawDays.map((d: unknown) => {
      if (d == null || typeof d !== 'object') return {} as SolDayDto;
      const o = d as Record<string, unknown>;
      const weekDayRaw = unwrapString(o.weekDay || o.weekday);
      const weekDay = parseInt(weekDayRaw, 10);
      return {
        date: unwrapString(o.date),
        sunrise: unwrapString(o.sunrise),
        sunset: unwrapString(o.sunset),
        weekDay: Number.isFinite(weekDay) ? weekDay : 0,
        aero: unwrapString(o.aero),
        geo: unwrapString(o.geo) || undefined,
      };
    });

    return { days };
  }
}
