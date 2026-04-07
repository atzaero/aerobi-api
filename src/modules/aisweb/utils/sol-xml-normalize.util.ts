import { SolDayDto } from '../dtos/sol-response.dto';
import { ensureArray } from './aisweb-xml-array.util';
import { unwrapCdata } from './aisweb-xml-cdata.util';

/** Garante que o parser retorne sempre array: um único <day> vira [day]. */
export function normalizeSolDays(parsed: {
  aisweb?: { day?: unknown };
}): unknown[] {
  const aisweb = parsed?.aisweb;
  if (!aisweb) return [];

  const raw = aisweb.day;
  if (raw == null) return [];

  return ensureArray(raw);
}

/** Converte o array de dias crus (do XML parsed) em DTOs tipados. */
export function transformSolDays(rawDays: unknown[]): SolDayDto[] {
  return rawDays.map((d) => {
    if (d == null || typeof d !== 'object') return {} as SolDayDto;
    const o = d as Record<string, unknown>;
    const weekDayRaw = unwrapCdata(o.weekDay || o.weekday);
    const weekDay = parseInt(weekDayRaw, 10);
    return {
      date: unwrapCdata(o.date),
      sunrise: unwrapCdata(o.sunrise),
      sunset: unwrapCdata(o.sunset),
      weekDay: Number.isFinite(weekDay) ? weekDay : 0,
      aero: unwrapCdata(o.aero),
      geo: unwrapCdata(o.geo) || undefined,
    };
  });
}
