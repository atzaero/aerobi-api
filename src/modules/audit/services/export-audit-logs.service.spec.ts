import { EXPORT_MAX_ROWS } from '@/common/utils/csv.util';

import type { AuditLogRepository } from '../repositories/audit-log.repository';
import { buildAuditLogFixture } from '../testing/audit-log.fixtures';

import { ExportAuditLogsService } from './export-audit-logs.service';

describe('ExportAuditLogsService', () => {
  let findManyForExport: jest.Mock;
  let countForExport: jest.Mock;
  let service: ExportAuditLogsService;

  beforeEach(() => {
    findManyForExport = jest.fn();
    countForExport = jest.fn();
    service = new ExportAuditLogsService({
      findManyForExport,
      countForExport,
    } as unknown as AuditLogRepository);
  });

  it('gera CSV com BOM e cabeçalhos pt-BR, sem truncar', async () => {
    findManyForExport.mockResolvedValue([buildAuditLogFixture()]);

    const res = await service.execute({});

    expect(res.truncated).toBe(false);
    expect(res.total).toBe(1);
    expect(res.csv.startsWith('﻿')).toBe(true);
    expect(res.csv).toContain('Data/Hora (UTC)');
    expect(res.csv).toContain('Ação');
    expect(res.csv).toContain('Papel do ator');
  });

  it('sinaliza truncamento acima do teto (EXPORT_MAX_ROWS)', async () => {
    const rows = Array.from({ length: EXPORT_MAX_ROWS + 1 }, () =>
      buildAuditLogFixture(),
    );
    findManyForExport.mockResolvedValue(rows);
    countForExport.mockResolvedValue(EXPORT_MAX_ROWS + 500);

    const res = await service.execute({});

    expect(res.truncated).toBe(true);
    expect(res.total).toBe(EXPORT_MAX_ROWS + 500);
  });
});
