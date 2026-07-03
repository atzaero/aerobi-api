/**
 * Tipos de entidade auditáveis (snake_case, singular) — espelha os `entityType`
 * gravados pelos call-sites do `aerobi-web`. Tipado no limite da API (os módulos
 * que chamam `AuditRecorderService.record` usam `AuditEntityType`), mas
 * persistido como `String` aberta na coluna `entity_type` (um valor fora desta
 * lista não quebra leitura/export — apenas cai no fallback de label).
 */
export const AUDIT_ENTITY_TYPES = [
  'group',
  'user',
  'aerodrome',
  'document',
  'landing_request',
  'technical_visit',
  'maintenance',
  'task',
  'feedback',
  'camera',
  'contact',
] as const;

/** União dos `entityType` canônicos auditados. */
export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[number];
