/** Tempo mínimo (ms) entre abrir o formulário e enviar — anti-bot. */
export const CONTACT_MIN_FORM_FILL_MS = 3_000;

/** Idade máxima aceita de `formOpenedAt` (24 h). */
export const CONTACT_MAX_FORM_OPENED_AGE_MS = 24 * 60 * 60 * 1_000;

/** Máximo de envios por IP (hash) por dia UTC. */
export const MAX_SUBMISSIONS_PER_IP_PER_DAY = 10;

/** `true` se o campo honeypot foi preenchido (bot). */
export function isContactHoneypotTripped(website: string | undefined): boolean {
  return Boolean(website?.trim());
}

/** `true` se o formulário foi enviado rápido demais para ser humano. */
export function isContactFormFilledTooFast(
  formOpenedAt: number,
  serverNowMs: number = Date.now(),
): boolean {
  if (!Number.isFinite(formOpenedAt) || formOpenedAt <= 0) {
    return true;
  }
  if (formOpenedAt > serverNowMs + 5 * 60_000) {
    return true;
  }
  return serverNowMs - formOpenedAt < CONTACT_MIN_FORM_FILL_MS;
}

/** `true` se `formOpenedAt` é antigo demais (provável falsificação no client). */
export function isContactFormOpenedTooOld(
  formOpenedAt: number,
  serverNowMs: number = Date.now(),
): boolean {
  if (!Number.isFinite(formOpenedAt) || formOpenedAt <= 0) {
    return true;
  }
  return serverNowMs - formOpenedAt > CONTACT_MAX_FORM_OPENED_AGE_MS;
}
