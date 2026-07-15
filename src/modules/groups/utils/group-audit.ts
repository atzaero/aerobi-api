import type { Group } from '@/generated/prisma/client';

/**
 * Recorte estável de um grupo para os snapshots `before`/`after` da auditoria.
 * Projeta só os campos identificadores/editáveis (`id`, `name`, `uf`) — evita
 * serializar dados voláteis do DTO de resposta (ex.: URLs presigned de imagem,
 * que expiram) na trilha append-only.
 */
export function groupAuditSnapshot(group: Group): {
  id: string;
  name: string;
  uf: string;
} {
  return { id: group.id, name: group.name, uf: group.uf };
}
