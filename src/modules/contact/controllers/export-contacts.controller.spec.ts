import type { Response } from 'express';

import type { ExportContactsService } from '../services/export-contacts.service';
import { resolveContactDate } from '../utils/contact-date.util';

import { ExportContactsController } from './export-contacts.controller';

describe('ExportContactsController', () => {
  let controller: ExportContactsController;
  let execute: jest.Mock;
  let set: jest.Mock;
  let res: Response;

  beforeEach(() => {
    execute = jest.fn();
    set = jest.fn();
    res = { set } as unknown as Response;
    controller = new ExportContactsController({
      execute,
    } as unknown as ExportContactsService);
  });

  it('não truncado: seta Content-Type/Disposition (filename com data) e retorna o CSV', async () => {
    execute.mockResolvedValue({ csv: 'CSV', truncated: false, total: 1 });

    const out = await controller.handle({}, res);

    expect(out).toBe('CSV');
    expect(set).toHaveBeenCalledWith({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="fale-conosco-${resolveContactDate()}.csv"`,
    });
    expect(set).toHaveBeenCalledTimes(1);
  });

  it('truncado: adiciona X-Export-Truncated e X-Export-Total', async () => {
    execute.mockResolvedValue({ csv: 'CSV', truncated: true, total: 50000 });

    await controller.handle({}, res);

    expect(set).toHaveBeenCalledWith({
      'X-Export-Truncated': 'true',
      'X-Export-Total': '50000',
    });
  });
});
