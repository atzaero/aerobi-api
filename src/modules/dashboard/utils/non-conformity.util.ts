import type { StatusBreakdown } from '../dtos/dashboard-response.dto';

/**
 * Flags de inspeção de uma visita técnica relevantes ao dashboard. Espelham as
 * colunas `Boolean?` do model `TechnicalVisit`; `null` (não preenchido) é tratado
 * como ausência (paridade com o `asBoolean` default-`false` do `aerobi-web`).
 */
export interface TechnicalVisitInspectionRow {
  hasGatesPadlocks: boolean | null;
  hasFence: boolean | null;
  hasStandardPlate: boolean | null;
  hasQualityHoles: boolean | null;
  hasHorizontalSignage: boolean | null;
  hasUnobstructedHeadboards: boolean | null;
  pavementRegularity: boolean | null;
  hasTrashDebris: boolean | null;
  hasDelimitedPerimeter: boolean | null;
  hasInvasion: boolean | null;
}

/**
 * Subconjunto **curado** de não-conformidades agregadas pelo dashboard, com a
 * polaridade única espelhada de `aerobi-web/src/lib/technical-visit.ts`
 * (`TECHNICAL_VISIT_NON_CONFORMITIES`). Ordem = ordem dos grupos de inspeção.
 *
 * Polaridade: itens cuja **presença** é boa (portões, cerca, placa, sinalização,
 * cabeceiras, regularidade, perímetro) → não-conformidade quando `!== true`;
 * itens que representam **problema** (buracos, lixo, invasão) → `=== true`.
 */
export const TECHNICAL_VISIT_NON_CONFORMITIES: ReadonlyArray<{
  key: string;
  flag: (v: TechnicalVisitInspectionRow) => boolean;
}> = [
  { key: 'sem_portoes_cadeados', flag: (v) => v.hasGatesPadlocks !== true },
  { key: 'sem_cerca', flag: (v) => v.hasFence !== true },
  { key: 'sem_placa_padrao', flag: (v) => v.hasStandardPlate !== true },
  { key: 'buracos', flag: (v) => v.hasQualityHoles === true },
  {
    key: 'sem_sinalizacao_horizontal',
    flag: (v) => v.hasHorizontalSignage !== true,
  },
  {
    key: 'cabeceiras_obstruidas',
    flag: (v) => v.hasUnobstructedHeadboards !== true,
  },
  { key: 'pavimento_irregular', flag: (v) => v.pavementRegularity !== true },
  { key: 'lixo_detritos', flag: (v) => v.hasTrashDebris === true },
  {
    key: 'perimetro_nao_delimitado',
    flag: (v) => v.hasDelimitedPerimeter !== true,
  },
  { key: 'invasao', flag: (v) => v.hasInvasion === true },
];

/**
 * Conta, por chave de não-conformidade, quantas visitas a registraram. Chaves com
 * contagem 0 são **omitidas** (paridade com o web).
 */
export function countNonConformities(
  visits: readonly TechnicalVisitInspectionRow[],
): StatusBreakdown {
  const out: StatusBreakdown = {};
  for (const { key, flag } of TECHNICAL_VISIT_NON_CONFORMITIES) {
    const count = visits.reduce((acc, v) => acc + (flag(v) ? 1 : 0), 0);
    if (count > 0) out[key] = count;
  }
  return out;
}
