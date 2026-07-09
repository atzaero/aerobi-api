import type {
  DashboardRangePreset,
  RangeGranularity,
} from '../dtos/dashboard-response.dto';

/**
 * Faixa de tempo do dashboard: traduz um preset (ou intervalo custom) em
 * `{ fromMs, toMs }` (ms epoch) e decide a granularidade dos baldes da série
 * temporal. Funções **puras** (recebem `now` injetável) — testáveis sem depender
 * do relógio. Espelha `aerobi-web/src/app/actions/dashboard/_shared/date-range.ts`.
 */
export interface DashboardRange {
  fromMs: number;
  toMs: number;
  preset: DashboardRangePreset;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Janela de cada preset em ms. `12m` = 365 dias corridos (paridade com o web,
 * não 12 × 30).
 */
const PRESET_SPAN_MS: Record<
  Exclude<DashboardRangePreset, 'custom'>,
  number
> = {
  '7d': 7 * DAY_MS,
  '30d': 30 * DAY_MS,
  '90d': 90 * DAY_MS,
  '12m': 365 * DAY_MS,
};

/**
 * Resolve a faixa a partir do input já validado. Para `custom`, o service garante
 * `from`/`to` presentes com `from <= to`; os fallbacks aqui são defensivos.
 */
export function resolveDashboardRange(
  input: { preset: DashboardRangePreset; from?: number; to?: number },
  now: number = Date.now(),
): DashboardRange {
  if (input.preset === 'custom') {
    return {
      fromMs: input.from ?? 0,
      toMs: input.to ?? now,
      preset: 'custom',
    };
  }
  return {
    fromMs: now - PRESET_SPAN_MS[input.preset],
    toMs: now,
    preset: input.preset,
  };
}

/**
 * Granularidade do balde conforme o tamanho da janela: até ~1 mês → dia; até ~1
 * trimestre → semana; acima → mês. Mantém as séries com um número de pontos
 * legível em qualquer preset.
 */
export function bucketGranularity(range: DashboardRange): RangeGranularity {
  const spanMs = range.toMs - range.fromMs;
  if (spanMs <= 31 * DAY_MS) return 'day';
  if (spanMs <= 92 * DAY_MS) return 'week';
  return 'month';
}
