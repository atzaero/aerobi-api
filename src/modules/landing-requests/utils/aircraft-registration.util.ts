/**
 * Regras de matrícula de aeronave — porte fiel de
 * `aerobi-web/src/lib/aircraft-registration.ts` (mesmos padrões/mensagens), para
 * o create público validar/normalizar a matrícula server-side por tipo
 * (nacional vs. estrangeira). A existência real da matrícula nacional é
 * confirmada depois pela consulta ao RAB.
 */

/** Marcas de nacionalidade brasileiras (ANAC). */
export const BRAZILIAN_AIRCRAFT_NATIONALITY_MARKS: readonly string[] = [
  'PS',
  'PT',
  'PP',
  'PR',
  'PU',
] as const;

/** Padrão oficial RAB (RBAC 45): prefixo brasileiro + hífen + 3 letras. */
const BRAZILIAN_REGISTRATION_PATTERN = /^(PS|PT|PP|PR|PU)-[A-Z]{3}$/;

/** Matrícula nacional alternativa (1ª letra ≠ P): exatamente 6 alfanuméricos. */
const NON_P_NATIONAL_REGISTRATION_PATTERN = /^[A-NO-Z0-9][A-Z0-9]{5}$/;

const NON_P_NATIONAL_REGISTRATION_LENGTH = 6;

const FOREIGN_REGISTRATION_MIN_LENGTH = 3;
const FOREIGN_REGISTRATION_MAX_LENGTH = 8;

/**
 * Normaliza a digitação nacional: uppercase, remove não-alfanuméricos e formata
 * marcas brasileiras como `XX-XXX`; demais padrões, até 12 caracteres.
 */
export function normalizeAircraftRegistration(raw: string): string {
  const alphanumeric = raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  if (alphanumeric.length === 0) {
    return '';
  }
  const prefix = alphanumeric.slice(0, 2);
  if (BRAZILIAN_AIRCRAFT_NATIONALITY_MARKS.includes(prefix)) {
    return `${prefix}-${alphanumeric.slice(2, 5)}`;
  }
  return alphanumeric.slice(0, 12);
}

/**
 * Valida a matrícula nacional normalizada. Retorna `null` se válida; caso
 * contrário, mensagem curta em pt-BR.
 */
export function getAircraftRegistrationValidationMessage(
  normalized: string,
): string | null {
  if (normalized.length === 0) {
    return 'Preencha a matrícula da aeronave';
  }
  if (BRAZILIAN_REGISTRATION_PATTERN.test(normalized)) {
    return null;
  }
  const compact = normalized.replace(/[^A-Z0-9]/g, '');
  if (
    compact.length > 0 &&
    compact[0] !== 'P' &&
    NON_P_NATIONAL_REGISTRATION_PATTERN.test(compact)
  ) {
    return null;
  }
  if (compact.length > 0 && compact[0] !== 'P') {
    return `Matrícula sem marca brasileira (P): use exatamente ${NON_P_NATIONAL_REGISTRATION_LENGTH} caracteres alfanuméricos.`;
  }
  return 'Use PS, PT, PP, PR ou PU, hífen e 3 letras (ex.: PT-ABC). Marque "Matrícula estrangeira" para outros padrões.';
}

/**
 * Normaliza a matrícula estrangeira: uppercase e remove não-alfanuméricos (não
 * trunca — a validação sinaliza excesso).
 */
export function normalizeForeignAircraftRegistration(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

/**
 * Valida a matrícula estrangeira normalizada (3 a 8 alfanuméricos). Retorna
 * `null` se válida; caso contrário, mensagem curta em pt-BR.
 */
export function getForeignAircraftRegistrationValidationMessage(
  normalized: string,
): string | null {
  if (normalized.length === 0) {
    return 'Preencha a matrícula da aeronave';
  }
  if (
    normalized.length < FOREIGN_REGISTRATION_MIN_LENGTH ||
    normalized.length > FOREIGN_REGISTRATION_MAX_LENGTH
  ) {
    return `Matrícula estrangeira: entre ${FOREIGN_REGISTRATION_MIN_LENGTH} e ${FOREIGN_REGISTRATION_MAX_LENGTH} caracteres alfanuméricos.`;
  }
  return null;
}

/**
 * Resolve a matrícula final (normalizada) por tipo, validando as regras do tipo.
 * Retorna `{ normalized }` quando válida ou `{ error }` com a mensagem pt-BR — o
 * service traduz o erro em `VALIDATION_FAILED`.
 */
export function resolveAircraftRegistration(
  raw: string,
  foreignRegistration: boolean,
): { normalized: string; error: null } | { normalized: null; error: string } {
  if (foreignRegistration) {
    const normalized = normalizeForeignAircraftRegistration(raw);
    const error = getForeignAircraftRegistrationValidationMessage(normalized);
    return error ? { normalized: null, error } : { normalized, error: null };
  }
  const normalized = normalizeAircraftRegistration(raw);
  const error = getAircraftRegistrationValidationMessage(normalized);
  return error ? { normalized: null, error } : { normalized, error: null };
}
