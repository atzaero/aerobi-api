/**
 * Resolve a data de rate-limit do feedback: o **dia UTC corrente** à meia-noite,
 * gravado na coluna `@db.Date` `feedbackDate`. Espelha o `resolveFeedbackDate` do
 * `aerobi-web` (`now.toISOString().split('T')[0]`), garantindo que dois envios da
 * mesma sessão no mesmo dia UTC colidam no `@@unique([sessionHash, aerodromeId,
 * feedbackDate])`.
 *
 * `now` é injetável para teste determinístico.
 */
export function resolveFeedbackDate(now: Date = new Date()): Date {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}
