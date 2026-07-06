/**
 * Tipos de recurso reconhecidos pelo `GroupScopeGuard`.
 *
 * Cada subject identifica de que tabela o `groupId` deve ser resolvido (ver
 * `groupScopeResolvers`). Declarado como objeto `as const` (não enum) para
 * permitir uso como valor de metadata e como union de string ao mesmo tempo.
 */
export const GroupScopeSubject = {
  /** `Group` — o recurso **é** o próprio grupo (`groupId === id`). */
  GROUP: 'group',
  /** `Aerodrome` — dono direto do `groupId`. */
  AERODROME: 'aerodrome',
  /** `LandingRequest` — resolve o `groupId` via FK para o aeródromo. */
  LANDING_REQUEST: 'landingRequest',
  /** `Feedback` — resolve o `groupId` via FK para o aeródromo. */
  FEEDBACK: 'feedback',
  /** `Camera` — resolve o `groupId` via FK para o aeródromo. */
  CAMERA: 'camera',
  /** `Maintenance` — resolve o `groupId` via FK para o aeródromo. */
  MAINTENANCE: 'maintenance',
  /** `MaintenanceTask` — resolve o `groupId` via manutenção → aeródromo. */
  TASK: 'task',
  /** `MaintenanceGuess` — resolve o `groupId` via tarefa → manutenção → aeródromo. */
  GUESS: 'guess',
} as const;

export type GroupScopeSubject =
  (typeof GroupScopeSubject)[keyof typeof GroupScopeSubject];
