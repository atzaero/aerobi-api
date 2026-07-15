import type { Response } from 'express';

import type { ExportAuditLogsQueryDto } from '../dtos/export-audit-logs-query.dto';
import type { ExportAuditLogsService } from '../services/export-audit-logs.service';

import { ExportAuditLogsController } from './export-audit-logs.controller';

describe('ExportAuditLogsController', () => {
  let controller: ExportAuditLogsController;
  let execute: jest.Mock;
  let set: jest.Mock;
  let res: Response;

  beforeEach(() => {
    execute = jest.fn();
    set = jest.fn();
    res = { set } as unknown as Response;
    controller = new ExportAuditLogsController({
      execute,
    } as unknown as ExportAuditLogsService);
  });

  it('devolve o CSV e seta os headers de download', async () => {
    execute.mockResolvedValue({
      csv: '﻿Data/Hora (UTC)\r\n',
      truncated: false,
      total: 0,
    });

    const query: ExportAuditLogsQueryDto = { entityType: 'user' };
    const csv = await controller.handle(query, res);

    expect(execute).toHaveBeenCalledWith(query);
    expect(csv.startsWith('﻿')).toBe(true);
    const [headers] = set.mock.calls[0] as [Record<string, string>];
    expect(headers['Content-Type']).toContain('text/csv');
    expect(headers['Content-Disposition']).toContain('auditoria-');
  });
});
