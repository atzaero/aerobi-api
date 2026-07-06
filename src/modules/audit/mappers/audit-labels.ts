import { AuditAction, UserRole } from '@/generated/prisma/client';

import type { AuditEntityType } from '../constants/audit-entity-type';

/**
 * Rótulos pt-BR das ações auditadas (espelha `AUDIT_ACTION_LABELS_PT` do
 * `aerobi-web`).
 */
export const AUDIT_ACTION_LABELS_PT: Record<AuditAction, string> = {
  [AuditAction.CREATE]: 'Criação',
  [AuditAction.UPDATE]: 'Atualização',
  [AuditAction.DELETE]: 'Exclusão',
};

/**
 * Rótulos pt-BR dos tipos de entidade. **Corrige o bug latente do web**, cujo
 * mapa usava `landingRequest` (camelCase) enquanto o dado é gravado como
 * `landing_request` (snake_case) — e faltavam 5 dos 11 tipos, caindo em
 * fallback. Aqui cobrimos os 11 `entityType` reais em snake_case.
 */
export const AUDIT_ENTITY_TYPE_LABELS_PT: Record<AuditEntityType, string> = {
  group: 'Grupo',
  user: 'Usuário',
  aerodrome: 'Aeródromo',
  document: 'Documento',
  landing_request: 'Solicitação de pouso',
  technical_visit: 'Visita técnica',
  maintenance: 'Manutenção',
  task: 'Tarefa',
  guess: 'Palpite',
  feedback: 'Feedback',
  camera: 'Câmera',
  contact: 'Mensagem de contato',
};

/**
 * Rótulos pt-BR dos papéis do ator. Chaveado pelo enum `UserRole` (MAIÚSCULAS),
 * pois o `actorRole` do audit é o papel real do ator na API — não a string
 * lowercase do Firestore.
 */
export const AUDIT_ACTOR_ROLE_LABELS_PT: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.COORDINATOR]: 'Coordenador',
  [UserRole.OPERATOR]: 'Operador',
  [UserRole.TECHNICAL]: 'Técnico',
};

/**
 * Resolve o rótulo pt-BR de um `entityType` com fallback ao valor bruto — a
 * coluna é `String` aberta, então um tipo não catalogado é exibido como veio.
 */
export function auditEntityTypeLabel(entityType: string): string {
  return (
    AUDIT_ENTITY_TYPE_LABELS_PT[entityType as AuditEntityType] ?? entityType
  );
}
