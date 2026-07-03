import type { User } from '@/generated/prisma/client';

/**
 * Recorte estável de um usuário para os snapshots `before`/`after` da auditoria.
 * Projeta só campos identificadores/administráveis — **nunca** `password` (nem o
 * hash) e nem dados voláteis. Usado pelos services de `users` ao gravar a trilha.
 */
export function userAuditSnapshot(user: User): {
  id: string;
  email: string;
  name: string;
  role: string;
  groupId: string | null;
} {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    groupId: user.groupId ?? null,
  };
}
