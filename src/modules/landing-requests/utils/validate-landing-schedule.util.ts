/** Antecedência mínima do pouso em relação a agora (3h), em milissegundos. */
export const LANDING_MIN_ADVANCE_FROM_NOW_MS = 3 * 60 * 60 * 1000;

/** Mensagens de validação da janela operacional (idênticas ao `aerobi-web`). */
const MESSAGES = {
  departureInPast:
    'A previsão de decolagem deve ser posterior ao horário atual em UTC (Zulu).',
  landingInPast:
    'A previsão de pouso deve ser posterior ao horário atual em UTC (Zulu).',
  landingBeforeDeparture:
    'A previsão de pouso deve ser depois da previsão de decolagem (horários em UTC / Zulu).',
  landingBeforeMinAdvance:
    'A previsão de pouso deve ser pelo menos 3 horas depois do horário atual em UTC (Zulu).',
  exitBeforeLanding:
    'A previsão de partida deve ser depois da previsão de pouso (horários em UTC / Zulu).',
} as const;

/**
 * Valida a janela operacional (decolagem → pouso → saída) contra `now`,
 * espelhando `refineLandingRequestSchedule` do `aerobi-web` na mesma ordem de
 * checagem: decolagem futura → pouso futuro/depois da decolagem/≥ 3h → saída
 * depois do pouso. Retorna a **primeira** violação (mensagem pt-BR) ou `null`
 * quando a janela é válida. As regras relativas a `now` ficam aqui (no service),
 * fora do DTO, que só garante que cada campo é uma data válida.
 */
export function validateLandingSchedule(
  departureAt: Date,
  landingAt: Date,
  exitAfterLandingAt: Date,
  now: Date,
): string | null {
  const nowMs = now.getTime();
  const minLandingMs = nowMs + LANDING_MIN_ADVANCE_FROM_NOW_MS;
  const dep = departureAt.getTime();
  const land = landingAt.getTime();
  const out = exitAfterLandingAt.getTime();

  if (dep <= nowMs) {
    return MESSAGES.departureInPast;
  }

  if (land <= nowMs) {
    return MESSAGES.landingInPast;
  }
  if (land <= dep) {
    return MESSAGES.landingBeforeDeparture;
  }
  if (land < minLandingMs) {
    return MESSAGES.landingBeforeMinAdvance;
  }

  if (out <= land) {
    return MESSAGES.exitBeforeLanding;
  }

  return null;
}
