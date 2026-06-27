import type { Response } from 'express';

import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { ExportAerodromeGroupsQueryDTO } from '../dtos/export-aerodrome-groups-query.dto';
import type { ExportAerodromeGroupsService } from '../services/export-aerodrome-groups.service';

import { ExportAerodromeGroupsController } from './export-aerodrome-groups.controller';

const actor: AuthenticatedUser = {
  id: 'admin-1',
  email: 'a@e',
  role: UserRole.ADMIN,
};

function mockResponse(): { res: Response; set: jest.Mock } {
  const set = jest.fn();
  return { res: { set } as unknown as Response, set };
}

describe('ExportAerodromeGroupsController', () => {
  let controller: ExportAerodromeGroupsController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new ExportAerodromeGroupsController({
      execute,
    } as unknown as ExportAerodromeGroupsService);
  });

  it('delega query e ator ao service e devolve o CSV', async () => {
    const query: ExportAerodromeGroupsQueryDTO = { name: 'x' };
    execute.mockResolvedValue({
      csv: '\uFEFFID,Nome',
      truncated: false,
      total: 1,
    });
    const { res } = mockResponse();
    await expect(controller.handle(query, actor, res)).resolves.toBe(
      '\uFEFFID,Nome',
    );
    expect(execute).toHaveBeenCalledWith(query, actor);
  });

  it('seta os headers de download e n\u00E3o marca truncamento no caso normal', async () => {
    const query: ExportAerodromeGroupsQueryDTO = {};
    execute.mockResolvedValue({
      csv: '\uFEFFID,Nome',
      truncated: false,
      total: 1,
    });
    const { res, set } = mockResponse();
    await controller.handle(query, actor, res);
    expect(set).toHaveBeenCalledWith({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="aerodrome-groups.csv"',
    });
    /** Sem truncamento, n\u00E3o h\u00E1 header `X-Export-*` (\u00FAnica chamada a `set`). */
    expect(set).toHaveBeenCalledTimes(1);
  });

  it('seta X-Export-Truncated e X-Export-Total quando truncado (#392)', async () => {
    const query: ExportAerodromeGroupsQueryDTO = {};
    execute.mockResolvedValue({
      csv: '\uFEFFID,Nome',
      truncated: true,
      total: 73_000,
    });
    const { res, set } = mockResponse();
    await controller.handle(query, actor, res);
    expect(set).toHaveBeenCalledWith({
      'X-Export-Truncated': 'true',
      'X-Export-Total': '73000',
    });
  });

  it('n\u00E3o seta headers de CSV quando o service lan\u00E7a (erro \u2192 JSON trat\u00E1vel)', async () => {
    const query: ExportAerodromeGroupsQueryDTO = {};
    execute.mockRejectedValue(new Error('boom'));
    const { res, set } = mockResponse();
    await expect(controller.handle(query, actor, res)).rejects.toThrow('boom');
    expect(set).not.toHaveBeenCalled();
  });
});
