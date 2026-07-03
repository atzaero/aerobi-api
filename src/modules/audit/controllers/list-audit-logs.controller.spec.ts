import { AuditLogsPaginatedResponseDto } from '../dtos/audit-logs-paginated-response.dto';
import type { ListAuditLogsQueryDto } from '../dtos/list-audit-logs-query.dto';
import type { ListAuditLogsService } from '../services/list-audit-logs.service';

import { ListAuditLogsController } from './list-audit-logs.controller';

describe('ListAuditLogsController', () => {
  let controller: ListAuditLogsController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new ListAuditLogsController({
      execute,
    } as unknown as ListAuditLogsService);
  });

  it('delega a query ao service', async () => {
    const query: ListAuditLogsQueryDto = {
      page: 1,
      limit: 20,
      entityType: 'user',
    };
    const result = new AuditLogsPaginatedResponseDto([], 1, 20, 0);
    execute.mockResolvedValue(result);

    await expect(controller.handle(query)).resolves.toBe(result);
    expect(execute).toHaveBeenCalledWith(query);
  });
});
