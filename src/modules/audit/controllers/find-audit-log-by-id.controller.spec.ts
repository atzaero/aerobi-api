import type { AuditLogResponseDto } from '../dtos/audit-log-response.dto';
import type { FindAuditLogByIdService } from '../services/find-audit-log-by-id.service';

import { FindAuditLogByIdController } from './find-audit-log-by-id.controller';

describe('FindAuditLogByIdController', () => {
  let controller: FindAuditLogByIdController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new FindAuditLogByIdController({
      execute,
    } as unknown as FindAuditLogByIdService);
  });

  it('delega o id (do param) ao service', async () => {
    const result = { id: 'a-1' } as AuditLogResponseDto;
    execute.mockResolvedValue(result);

    await expect(controller.handle({ id: 'a-1' })).resolves.toBe(result);
    expect(execute).toHaveBeenCalledWith('a-1');
  });
});
