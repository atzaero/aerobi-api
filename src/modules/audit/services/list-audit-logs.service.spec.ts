import { AuditAction } from '@/generated/prisma/client';

import type { ListAuditLogsQueryDto } from '../dtos/list-audit-logs-query.dto';
import type { AuditLogRepository } from '../repositories/audit-log.repository';
import { buildAuditLogFixture } from '../testing/audit-log.fixtures';

import { ListAuditLogsService } from './list-audit-logs.service';

describe('ListAuditLogsService', () => {
  let findManyPaginated: jest.Mock;
  let service: ListAuditLogsService;

  beforeEach(() => {
    findManyPaginated = jest
      .fn()
      .mockResolvedValue({ rows: [buildAuditLogFixture()], total: 1 });
    service = new ListAuditLogsService({
      findManyPaginated,
    } as unknown as AuditLogRepository);
  });

  function run(query: Partial<ListAuditLogsQueryDto> = {}) {
    return service.execute(query);
  }

  it('default: page 1, limit 20 (paridade com o web)', async () => {
    const res = await run();

    expect(findManyPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 20 }),
    );
    expect(res.meta.currentPage).toBe(1);
    expect(res.meta.itemsPerPage).toBe(20);
    expect(res.meta.totalItems).toBe(1);
    expect(res.data).toHaveLength(1);
  });

  it('converte from/to (ms epoch) para Date', async () => {
    await run({ from: 1719792000000, to: 1719878399999 });

    const [firstCall] = findManyPaginated.mock.calls as Array<
      [{ from: Date; to: Date }]
    >;
    expect(firstCall[0].from).toEqual(new Date(1719792000000));
    expect(firstCall[0].to).toEqual(new Date(1719878399999));
  });

  it('repassa filtros de igualdade', async () => {
    await run({
      entityType: 'user',
      actorEmail: 'a@x',
      action: AuditAction.UPDATE,
    });

    expect(findManyPaginated).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'user',
        actorEmail: 'a@x',
        action: AuditAction.UPDATE,
      }),
    );
  });

  it('limit é limitado ao teto de 100', async () => {
    await run({ limit: 500 });

    expect(findManyPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 }),
    );
  });
});
