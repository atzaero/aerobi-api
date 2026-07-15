import type {
  RangeGranularity,
  StatusBreakdown,
  TimeSeriesDTO,
  TimeSeriesPointDTO,
} from '../dtos/dashboard-response.dto';

/**
 * Agregações **puras** sobre listas de linhas já lidas e escopadas. Espelha
 * `aerobi-web/src/app/actions/dashboard/_shared/aggregate.ts`: carregamos
 * as linhas mínimas do escopo/range e agregamos aqui em memória — mesma estratégia
 * do web (volume pequeno/médio dos aeródromos rurais justifica; reavaliar via
 * follow-up de cache/SQL quando crescer). Determinístico em UTC para casar com os
 * timestamps e ser testável sem depender do fuso local.
 */
const DAY_MS = 24 * 60 * 60 * 1000;

/** Contagem por chave; ignora itens cuja chave seja `null`/`undefined`. */
export function countByStatus<T>(
  items: readonly T[],
  getKey: (item: T) => string | null | undefined,
): StatusBreakdown {
  const out: StatusBreakdown = {};
  for (const item of items) {
    const key = getKey(item);
    if (key == null) continue;
    out[key] = (out[key] ?? 0) + 1;
  }
  return out;
}

/** Soma de um campo numérico; ignora valores ausentes/não-finitos. */
export function sumBy<T>(
  items: readonly T[],
  getValue: (item: T) => number | null | undefined,
): number {
  let total = 0;
  for (const item of items) {
    const v = getValue(item);
    if (typeof v === 'number' && Number.isFinite(v)) total += v;
  }
  return total;
}

/**
 * Média (arredondada) dos valores finitos, ou `null` se a lista estiver vazia.
 * Usada pelo `avgResponseMs` de `landing-requests`.
 */
export function averageOrNull(values: readonly number[]): number | null {
  return values.length
    ? Math.round(sumBy(values, (ms) => ms) / values.length)
    : null;
}

/**
 * Início (ms epoch, UTC) do balde que contém `ms`, conforme a granularidade.
 * Semana começa no **domingo** (UTC).
 */
export function bucketStart(ms: number, granularity: RangeGranularity): number {
  const d = new Date(ms);
  const dayStart = Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
  );
  if (granularity === 'day') return dayStart;
  if (granularity === 'week') {
    const dow = new Date(dayStart).getUTCDay();
    return dayStart - dow * DAY_MS;
  }
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
}

/**
 * Série temporal: bucketiza os itens pelo timestamp `getMs` na granularidade
 * dada, somando contagens por balde. Pontos ordenados por tempo crescente. Itens
 * sem timestamp válido são ignorados.
 */
export function timeSeriesByPeriod<T>(
  items: readonly T[],
  getMs: (item: T) => number | null | undefined,
  granularity: RangeGranularity,
): TimeSeriesDTO {
  const counts = new Map<number, number>();
  for (const item of items) {
    const ms = getMs(item);
    if (ms == null || !Number.isFinite(ms)) continue;
    const bucket = bucketStart(ms, granularity);
    counts.set(bucket, (counts.get(bucket) ?? 0) + 1);
  }
  const points: TimeSeriesPointDTO[] = Array.from(counts.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([bucket, count]) => ({ bucket, count }));
  return { granularity, points };
}
