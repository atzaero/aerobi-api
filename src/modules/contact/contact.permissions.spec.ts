import { can } from '@/modules/auth/permissions/permissions';
import { UserRole } from '@/generated/prisma/client';

describe('permissions contact', () => {
  it('somente ADMIN pode listar/exportar/atualizar/deletar contact', () => {
    expect(can(UserRole.ADMIN, 'contact', 'list')).toBe(true);
    expect(can(UserRole.ADMIN, 'contact', 'export')).toBe(true);
    expect(can(UserRole.ADMIN, 'contact', 'update')).toBe(true);
    expect(can(UserRole.ADMIN, 'contact', 'delete')).toBe(true);
    expect(can(UserRole.COORDINATOR, 'contact', 'list')).toBe(false);
    expect(can(UserRole.OPERATOR, 'contact', 'list')).toBe(false);
  });
});
