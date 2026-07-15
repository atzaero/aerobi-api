import type { CsvColumn } from '@/common/utils/csv.util';
import { UserRole } from '@/generated/prisma/client';

import type { UserWithGroupName } from '../repositories/user.repository.interface';

/**
 * Rótulos pt-BR dos papéis (espelha `USER_ROLE_LABELS_PT` do `aerobi-web`).
 */
export const USER_ROLE_LABELS_PT: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.COORDINATOR]: 'Coordenador',
  [UserRole.OPERATOR]: 'Operador',
  [UserRole.TECHNICAL]: 'Técnico',
};

/**
 * Colunas do export CSV de usuários (espelha `export/columns.ts` do `aerobi-web`),
 * com cabeçalhos pt-BR. Telefone em E.164 canônico e Grupo pelo **nome** (não o
 * id). Campos nulos viram string vazia; data em ISO 8601 UTC.
 */
export const userExportColumns: CsvColumn<UserWithGroupName>[] = [
  { header: 'Nome', accessor: (user) => user.name },
  { header: 'E-mail', accessor: (user) => user.email },
  { header: 'Telefone', accessor: (user) => user.phone ?? '' },
  {
    header: 'Perfil',
    accessor: (user) => USER_ROLE_LABELS_PT[user.role] ?? user.role,
  },
  { header: 'Grupo', accessor: (user) => user.group?.name ?? '' },
  { header: 'UF', accessor: (user) => user.state ?? '' },
  {
    header: 'Criado em (UTC)',
    accessor: (user) => user.createdAt.toISOString(),
  },
];
