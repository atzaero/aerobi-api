import { AuditAction, UserRole } from '@/generated/prisma/client';
import type { AuditLog } from '@/generated/prisma/client';

import { buildAuditLogFixture } from '../testing/audit-log.fixtures';

import { auditExportColumns } from './audit-export.columns';

function cell(header: string, log: AuditLog): string {
  const col = auditExportColumns.find((c) => c.header === header);
  if (!col) throw new Error(`coluna não encontrada: ${header}`);
  return String(col.accessor(log) ?? '');
}

describe('auditExportColumns', () => {
  it('traduz action e entityType para pt-BR (corrige o bug snake_case do web)', () => {
    const log = buildAuditLogFixture({
      action: AuditAction.UPDATE,
      entityType: 'landing_request',
    });

    expect(cell('Ação', log)).toBe('Atualização');
    expect(cell('Entidade', log)).toBe('Solicitação de pouso');
  });

  it('entityType desconhecido cai no valor bruto (fallback)', () => {
    expect(
      cell('Entidade', buildAuditLogFixture({ entityType: 'unknown_thing' })),
    ).toBe('unknown_thing');
  });

  it('papel do ator traduzido; nulo vira string vazia', () => {
    expect(
      cell(
        'Papel do ator',
        buildAuditLogFixture({ actorRole: UserRole.COORDINATOR }),
      ),
    ).toBe('Coordenador');
    expect(
      cell('Papel do ator', buildAuditLogFixture({ actorRole: null })),
    ).toBe('');
  });

  it('data em ISO 8601 UTC', () => {
    const log = buildAuditLogFixture({
      createdAt: new Date('2026-07-03T12:00:00.000Z'),
    });
    expect(cell('Data/Hora (UTC)', log)).toBe('2026-07-03T12:00:00.000Z');
  });
});
