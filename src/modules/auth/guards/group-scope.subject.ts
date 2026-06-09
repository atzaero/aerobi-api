/**
 * Tipos de recurso reconhecidos pelo `GroupScopeGuard`.
 *
 * Cada subject identifica de que tabela o `groupId` deve ser resolvido (ver
 * `groupScopeResolvers`). Declarado como objeto `as const` (não enum) para
 * permitir uso como valor de metadata e como union de string ao mesmo tempo.
 */
export const GroupScopeSubject = {
  /** `OperationalAerodrome` — dono direto do `groupId`. */
  OPERATIONAL_AERODROME: 'operationalAerodrome',
  /** `LandingRequest` — resolve o `groupId` via FK para o aeródromo. */
  LANDING_REQUEST: 'landingRequest',
} as const;

export type GroupScopeSubject =
  (typeof GroupScopeSubject)[keyof typeof GroupScopeSubject];
