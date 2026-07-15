import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { EXPORT_MAX_ROWS, toCsv } from '@/common/utils/csv.util';

import { contactExportColumns } from '../mappers/contact-export.columns';
import type { IContactRepository } from '../repositories/contact.repository.interface';
import { buildContactFixture } from '../testing/contact.fixture';
import { ExportContactsService } from './export-contacts.service';

describe('ExportContactsService', () => {
  let service: ExportContactsService;
  let findManyForExport: jest.Mock;
  let countForExport: jest.Mock;

  beforeEach(() => {
    findManyForExport = jest.fn();
    countForExport = jest.fn();
    const repo = {
      findManyForExport,
      countForExport,
    } as unknown as IContactRepository;
    service = new ExportContactsService(repo, new ErrorMessageService());
  });

  it('gera CSV com BOM e colunas pt-BR', async () => {
    const row = buildContactFixture();
    findManyForExport.mockResolvedValue([row]);

    const { csv, truncated } = await service.execute({});

    expect(truncated).toBe(false);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain('Dúvida');
    expect(csv).toContain(row.email);
  });

  it('sinaliza truncamento acima de EXPORT_MAX_ROWS', async () => {
    const rows = Array.from({ length: EXPORT_MAX_ROWS + 1 }, () =>
      buildContactFixture(),
    );
    findManyForExport.mockResolvedValue(rows);
    countForExport.mockResolvedValue(EXPORT_MAX_ROWS + 10);

    const { truncated, total } = await service.execute({});

    expect(truncated).toBe(true);
    expect(total).toBeGreaterThanOrEqual(EXPORT_MAX_ROWS);
    const lines = toCsv(rows.slice(0, 1), contactExportColumns).split('\r\n');
    expect(lines.length).toBeGreaterThanOrEqual(2);
  });
});
