import { AuditAction } from '@/generated/prisma/client';
import type { PrismaService } from '@/prisma/prisma.service';

import { buildAuditLogFixture } from '../testing/audit-log.fixtures';

import { AuditLogRepository } from './audit-log.repository';

describe('AuditLogRepository', () => {
  let create: jest.Mock;
  let findMany: jest.Mock;
  let count: jest.Mock;
  let findUnique: jest.Mock;
  let repo: AuditLogRepository;

  beforeEach(() => {
    create = jest.fn();
    findMany = jest.fn();
    count = jest.fn();
    findUnique = jest.fn();
    const prisma = {
      auditLog: { create, findMany, count, findUnique },
      $transaction: (ops: Promise<unknown>[]) => Promise.all(ops),
    } as unknown as PrismaService;
    repo = new AuditLogRepository(prisma);
  });

  it('create delega ao builder (omite json ausente)', async () => {
    create.mockResolvedValue(buildAuditLogFixture());

    await repo.create({
      action: AuditAction.CREATE,
      entityType: 'user',
      entityId: 't-1',
    });

    const [firstCall] = create.mock.calls as Array<
      [{ data: Record<string, unknown> }]
    >;
    const { data } = firstCall[0];
    expect(data.entityType).toBe('user');
    expect('before' in data).toBe(false);
  });

  it('findManyPaginated ordena createdAt desc + tiebreaker id via $transaction', async () => {
    findMany.mockResolvedValue([buildAuditLogFixture()]);
    count.mockResolvedValue(1);

    const res = await repo.findManyPaginated({ skip: 0, take: 20 });

    expect(res.total).toBe(1);
    expect(res.rows).toHaveLength(1);
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 20,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),
    );
  });

  it('findById usa findUnique por id', async () => {
    findUnique.mockResolvedValue(buildAuditLogFixture({ id: 'a-1' }));

    const res = await repo.findById('a-1');

    expect(res?.id).toBe('a-1');
    expect(findUnique).toHaveBeenCalledWith({ where: { id: 'a-1' } });
  });

  it('findManyForExport aplica o teto (take) e a ordenação', async () => {
    findMany.mockResolvedValue([]);

    await repo.findManyForExport({ entityType: 'user' }, 51);

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { entityType: 'user' },
        take: 51,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),
    );
  });
});
