import { UserRole } from '@/generated/prisma/client';

import {
  buildUserCreateInput,
  buildUserSoftDeleteInput,
  buildUserUpdateInput,
  buildUserWhere,
} from './user-prisma.builder';

describe('user-prisma.builder', () => {
  describe('buildUserCreateInput', () => {
    it('inclui obrigatórios e omite opcionais ausentes', () => {
      const input = buildUserCreateInput({
        email: 'a@x',
        name: 'A',
        role: UserRole.OPERATOR,
      });

      expect(input).toEqual({
        email: 'a@x',
        name: 'A',
        role: UserRole.OPERATOR,
      });
      expect('phone' in input).toBe(false);
      expect('groupId' in input).toBe(false);
    });

    it('inclui opcionais presentes (inclusive phone null)', () => {
      const input = buildUserCreateInput({
        email: 'a@x',
        name: 'A',
        role: UserRole.OPERATOR,
        phone: null,
        groupId: 'g1',
        createdBy: 'admin-1',
      });

      expect(input.phone).toBeNull();
      expect(input.groupId).toBe('g1');
      expect(input.createdBy).toBe('admin-1');
    });
  });

  describe('buildUserUpdateInput', () => {
    it('inclui só os campos enviados', () => {
      expect(buildUserUpdateInput({ name: 'Novo', updatedBy: 'u-1' })).toEqual({
        name: 'Novo',
        updatedBy: 'u-1',
      });
    });

    it('preserva null (limpar telefone)', () => {
      expect(buildUserUpdateInput({ phone: null })).toEqual({ phone: null });
    });

    it('objeto vazio quando nada é enviado', () => {
      expect(buildUserUpdateInput({})).toEqual({});
    });
  });

  describe('buildUserSoftDeleteInput', () => {
    const at = new Date('2026-06-30T00:00:00.000Z');

    it('inclui deletedBy/updatedBy quando informado', () => {
      expect(buildUserSoftDeleteInput(at, 'admin-1')).toEqual({
        deletedAt: at,
        deletedBy: 'admin-1',
        updatedBy: 'admin-1',
      });
    });

    it('só deletedAt quando deletedBy ausente', () => {
      expect(buildUserSoftDeleteInput(at)).toEqual({ deletedAt: at });
    });
  });

  describe('buildUserWhere', () => {
    it('sempre filtra ativos (deletedAt null)', () => {
      expect(buildUserWhere({})).toEqual({ deletedAt: null });
    });

    it('aplica role e groupId por igualdade', () => {
      expect(buildUserWhere({ role: UserRole.ADMIN, groupId: 'g1' })).toEqual({
        deletedAt: null,
        role: UserRole.ADMIN,
        groupId: 'g1',
      });
    });

    it('search vira OR ILIKE em email e nome', () => {
      const where = buildUserWhere({ search: 'jo' });
      expect(where.OR).toEqual([
        { email: { contains: 'jo', mode: 'insensitive' } },
        { name: { contains: 'jo', mode: 'insensitive' } },
      ]);
    });

    it('search só de espaços não gera OR', () => {
      expect(buildUserWhere({ search: '   ' }).OR).toBeUndefined();
    });
  });
});
