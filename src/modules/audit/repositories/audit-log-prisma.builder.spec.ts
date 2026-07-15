import { AuditAction, UserRole } from '@/generated/prisma/client';

import {
  buildAuditLogCreateInput,
  buildAuditLogWhere,
} from './audit-log-prisma.builder';

describe('audit-log-prisma.builder', () => {
  describe('buildAuditLogWhere', () => {
    it('vazio quando não há filtros', () => {
      expect(buildAuditLogWhere({})).toEqual({});
    });

    it('igualdade exata em entityType/actorEmail/action', () => {
      expect(
        buildAuditLogWhere({
          entityType: 'user',
          actorEmail: 'a@x',
          action: AuditAction.UPDATE,
        }),
      ).toEqual({
        entityType: 'user',
        actorEmail: 'a@x',
        action: AuditAction.UPDATE,
      });
    });

    it('range inclusivo [from, to] em createdAt', () => {
      const from = new Date('2026-07-01T00:00:00.000Z');
      const to = new Date('2026-07-02T00:00:00.000Z');
      expect(buildAuditLogWhere({ from, to })).toEqual({
        createdAt: { gte: from, lte: to },
      });
    });

    it('só from → gte; só to → lte', () => {
      const from = new Date('2026-07-01T00:00:00.000Z');
      const to = new Date('2026-07-02T00:00:00.000Z');
      expect(buildAuditLogWhere({ from })).toEqual({
        createdAt: { gte: from },
      });
      expect(buildAuditLogWhere({ to })).toEqual({ createdAt: { lte: to } });
    });
  });

  describe('buildAuditLogCreateInput', () => {
    const base = {
      action: AuditAction.CREATE,
      entityType: 'user',
      entityId: 't-1',
    } as const;

    it('normaliza actor/ip/ua ausentes para null e omite json ausente', () => {
      const input = buildAuditLogCreateInput({ ...base });

      expect(input).toEqual({
        actorId: null,
        actorEmail: null,
        actorRole: null,
        action: AuditAction.CREATE,
        entityType: 'user',
        entityId: 't-1',
        ipAddress: null,
        userAgent: null,
      });
      expect('before' in input).toBe(false);
      expect('after' in input).toBe(false);
      expect('metadata' in input).toBe(false);
    });

    it('inclui before/after/metadata/actorRole presentes', () => {
      const input = buildAuditLogCreateInput({
        ...base,
        action: AuditAction.UPDATE,
        actorRole: UserRole.ADMIN,
        before: { a: 1 },
        after: { a: 2 },
        metadata: { scope: 'reset-password' },
      });

      expect(input.before).toEqual({ a: 1 });
      expect(input.after).toEqual({ a: 2 });
      expect(input.metadata).toEqual({ scope: 'reset-password' });
      expect(input.actorRole).toBe(UserRole.ADMIN);
    });

    it('omite json null/undefined (coluna fica NULL)', () => {
      const input = buildAuditLogCreateInput({
        ...base,
        before: null,
        after: undefined,
        metadata: null,
      });

      expect('before' in input).toBe(false);
      expect('after' in input).toBe(false);
      expect('metadata' in input).toBe(false);
    });
  });
});
